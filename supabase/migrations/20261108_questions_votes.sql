
-- Run this file in Supabase SQL Editor as the postgres database role.
-- Existing exam_questions, question_options, subjects and materials tables are preserved.

begin;

create or replace function public.submit_exam_question(
    p_subject_id uuid,
    p_question_text text,
    p_question_type text,
    p_exam_type text,
    p_exam_date date,
    p_correct_answer text,
    p_options jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
new_id uuid;
    option_item jsonb;
    option_index integer;
    correct_count integer := 0;
    selected_answer text;
    seen_options text[] := array[]::text[];
    option_text text;
begin
    if p_subject_id is null or
       p_question_type is null or p_question_type not in ('OPEN', 'SINGLE_CHOICE') or
       p_exam_type is null or p_exam_type not in ('MIDTERM', 'EXAM', 'TEST') or
       p_question_text is null or length(btrim(p_question_text)) not between 10 and 2000 or
       p_correct_answer is null or length(btrim(p_correct_answer)) not between 1 and 2000 or
       (p_exam_date is not null and p_exam_date > current_date) then
        raise exception 'Invalid question';
end if;

    if p_question_type = 'SINGLE_CHOICE' then
        if p_options is null or jsonb_typeof(p_options) is distinct from 'array' then
            raise exception 'Options must be an array';
end if;

        if jsonb_array_length(p_options) <> 4 then
            raise exception 'Four options are required';
end if;

for option_index in 0..3 loop
            option_item := p_options->option_index;

            if jsonb_typeof(option_item) is distinct from 'object' or
               jsonb_typeof(option_item->'text') is distinct from 'string' or
               jsonb_typeof(option_item->'isCorrect') is distinct from 'boolean' then
                raise exception 'Invalid option';
end if;

            option_text := btrim(option_item->>'text');

            if length(option_text) not between 1 and 500 or
               lower(option_text) = any(seen_options) then
                raise exception 'Options must be nonempty and distinct';
end if;

            seen_options := array_append(seen_options, lower(option_text));

            if (option_item->>'isCorrect')::boolean then
                correct_count := correct_count + 1;
                selected_answer := option_text;
end if;
end loop;

        if correct_count <> 1 or
           btrim(p_correct_answer) is distinct from selected_answer then
            raise exception 'Exactly one matching correct answer is required';
end if;

    elsif p_options is not null and p_options <> '[]'::jsonb then
        raise exception 'Open questions cannot have options';
end if;

insert into public.exam_questions
(subject_id, question_text, question_type, exam_type, exam_date, correct_answer)
values
    (
        p_subject_id,
        btrim(p_question_text),
        p_question_type,
        p_exam_type,
        p_exam_date,
        btrim(p_correct_answer)
    )
    returning id into new_id;

if p_question_type = 'SINGLE_CHOICE' then
        for option_index in 0..3 loop
            option_item := p_options->option_index;

insert into public.question_options
(question_id, option_text, is_correct)
values
    (
        new_id,
        btrim(option_item->>'text'),
        (option_item->>'isCorrect')::boolean
    );
end loop;
end if;

return new_id;
end;
$$;

alter function public.submit_exam_question(
    uuid, text, text, text, date, text, jsonb
    ) owner to postgres;

revoke all on function public.submit_exam_question(
    uuid, text, text, text, date, text, jsonb
    ) from public, anon, authenticated;

grant execute on function public.submit_exam_question(
    uuid, text, text, text, date, text, jsonb
) to service_role;


-- Material voting table

create table if not exists public.material_votes (
                                                     id uuid primary key default gen_random_uuid(),
    material_id uuid not null references public.materials(id) on delete cascade,
    visitor_hash text not null,
    vote smallint not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

-- One vote per visitor and material.
-- This index also supports lookups by material_id.

create unique index if not exists material_votes_one_vote_idx
    on public.material_votes (material_id, visitor_hash);


-- Add validation constraints if they do not already exist.

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.material_votes'::regclass
          and conname = 'material_votes_hash_check'
    ) then
alter table public.material_votes
    add constraint material_votes_hash_check
        check (visitor_hash ~ '^[0-9a-f]{64}$');
end if;

    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.material_votes'::regclass
          and conname = 'material_votes_vote_check'
    ) then
alter table public.material_votes
    add constraint material_votes_vote_check
        check (vote in (-1, 1));
end if;
end;
$$;


-- Enable RLS.
-- Anonymous clients cannot access votes directly.
-- Server routes use the service-role key.

alter table public.material_votes enable row level security;

revoke all on public.material_votes
    from public, anon, authenticated;

grant select, insert, update on public.material_votes
    to service_role;

-- Existing table data and RLS policies on other tables remain unchanged.

commit;
