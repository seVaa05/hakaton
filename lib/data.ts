export type Subject = { id: string; name: string; code: string; year: 1 | 2 | 3 | 4; category: string; description: string; color: string; icon: string };
export type Material = { id: string; subjectId: string; title: string; description: string; type: string; url: string; author: string; date: string; likes: number; rating: number; reviews: number };
export type ExamQuestion = { id: string; subjectId: string; examType: 'Exam' | 'Midterm'; type: 'multiple-choice' | 'open-ended'; prompt: string; options?: string[]; correctAnswer?: number; sampleAnswer?: string; year: string };

export const subjects: Subject[] = [
  ['calculus','Matematička analiza I','MAT 101',1,'Matematika','Granične vrednosti, izvodi, integrali i osnove analize.','violet','∑'],
  ['programming','Uvod u programiranje','CS 102',1,'Računarstvo','Osnove programiranja, rešavanje problema i algoritmi.','blue','{ }'],
  ['physics','Fizika I','PHY 103',1,'Prirodne nauke','Mehanika, kretanje, energija i fizički svet.','orange','◉'],
  ['data-structures','Strukture podataka','CS 201',2,'Računarstvo','Nizovi, stabla, grafovi i efikasna organizacija podataka.','blue','⌘'],
  ['statistics','Verovatnoća i statistika','MAT 202',2,'Matematika','Modeli verovatnoće, statističko zaključivanje i analiza podataka.','violet','σ'],
  ['databases','Baze podataka','CS 203',2,'Računarstvo','Relacioni modeli, SQL i projektovanje baza podataka.','mint','▦'],
  ['algorithms','Algoritmi','CS 301',3,'Računarstvo','Projektovanje, analiza i optimizacija algoritama.','orange','◇'],
  ['networks','Računarske mreže','CS 302',3,'Računarstvo','Protokoli, rutiranje i povezani sistemi.','blue','◎'],
  ['software-engineering','Softversko inženjerstvo','CS 303',3,'Inženjerstvo','Timsko projektovanje, razvoj i održavanje softvera.','mint','✳'],
  ['machine-learning','Mašinsko učenje','CS 401',4,'Računarstvo','Učenje iz podataka pomoću prediktivnih modela.','violet','✦'],
  ['security','Sajber bezbednost','CS 402',4,'Računarstvo','Zaštita sistema, mreža i informacija.','orange','⬡'],
  ['capstone','Završni projekat','CS 403',4,'Projekat','Primena znanja na stvarnom problemu.','mint','◈'],
].map(([id,name,code,year,category,description,color,icon]) => ({id,name,code,year,category,description,color,icon} as Subject));

export const materials: Material[] = [
  ['calculus','Matematička analiza I — kompletne beleške','Jasan vodič od graničnih vrednosti do integrala.','PDF','https://openstax.org/details/books/calculus-volume-1','Emma R.',248,4.9,38],
  ['programming','Priručnik za osnove Pythona','Sintaksa, funkcije i praktični zadaci za početnike.','Link','https://docs.python.org/3/tutorial/','Alex M.',193,4.8,27],
  ['data-structures','Vizuelni vodič kroz strukture podataka','Ilustrovana objašnjenja povezanih lista, stabala, grafova i hipova.','Beleške','https://www.geeksforgeeks.org/data-structures/','Noah K.',176,4.7,22],
  ['statistics','Formule iz verovatnoće','Najvažnije raspodele, formule i rešeni primeri.','PDF','https://openstax.org/details/books/introductory-statistics-2e','Mia S.',154,4.8,19],
  ['databases','SQL zbirka zadataka','Vežbajte upite, od osnova SELECT naredbe do složenih spajanja.','Link','https://www.postgresql.org/docs/current/tutorial.html','Liam T.',131,4.6,16],
  ['algorithms','Podsetnik za projektovanje algoritama','Složenost, sortiranje, pretraga i rad sa grafovima na jednom mestu.','Beleške','https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/','Sofia L.',219,4.9,31],
  ['physics','Vodič za učenje mehanike','Sažeci pojmova i zadaci iz klasične mehanike.','PDF','https://openstax.org/details/books/university-physics-volume-1','Ethan P.',117,4.7,14],
  ['machine-learning','Beleške iz mašinskog učenja','Osnovni modeli, evaluacija i praktične strategije učenja.','Link','https://developers.google.com/machine-learning/crash-course','Ava B.',186,4.8,25],
].map(([subjectId,title,description,type,url,author,likes,rating,reviews],i) => ({id:`m${i+1}`,subjectId,title,description,type,url,author,date:'oktobar 2026',likes,rating,reviews} as Material));

export const questions: ExamQuestion[] = [
  ['calculus','Exam','multiple-choice','Koliki je izvod funkcije x²?',['x','2x','x²','2'],1],
  ['calculus','Midterm','open-ended','Objasnite pravilo za izvod složene funkcije i navedite primer njegove primene.',undefined,undefined,'Ako je y = f(g(x)), onda je dy/dx = f′(g(x))g′(x). Na primer, d/dx sin(x²) = 2x cos(x²).'],
  ['calculus','Exam','multiple-choice','Koliki je neodređeni integral funkcije 2x?',['2x² + C','x² + C','x + C','2 + C'],1],
  ['programming','Midterm','multiple-choice','Koji tip podataka čuva vrednosti tačno ili netačno?',['Tekst','Ceo broj','Logički tip','Decimalni broj'],2],
  ['programming','Exam','open-ended','Koja je razlika između parametra funkcije i argumenta?',undefined,undefined,'Parametar je promenljiva u definiciji funkcije, a argument je konkretna vrednost prosleđena pri pozivu.'],
  ['physics','Exam','multiple-choice','Koja je SI jedinica za silu?',['Džul','Vat','Njutn','Paskal'],2],
  ['data-structures','Midterm','multiple-choice','Koja struktura podataka radi po principu prvi ušao, prvi izašao?',['Stek','Red','Stablo','Hip'],1],
  ['data-structures','Exam','open-ended','Opišite razliku između steka i reda.',undefined,undefined,'Stek radi po principu poslednji ušao, prvi izašao; red po principu prvi ušao, prvi izašao.'],
  ['statistics','Exam','multiple-choice','Kolika je verovatnoća da pri bacanju pravilnog novčića padne glava?',['0.25','0.5','0.75','1'],1],
  ['databases','Midterm','multiple-choice','Koja SQL klauzula filtrira redove?',['ORDER BY','WHERE','GROUP BY','JOIN'],1],
  ['algorithms','Exam','multiple-choice','Kolika je prosečna vremenska složenost binarne pretrage?',['O(1)','O(log n)','O(n)','O(n²)'],1],
  ['algorithms','Midterm','open-ended','Objasnite kada je pohlepni algoritam pogodan.',undefined,undefined,'Koristi se kada lokalno optimalni izbori vode do globalno optimalnog rešenja.'],
  ['networks','Exam','multiple-choice','Koji protokol prevodi nazive domena u IP adrese?',['HTTP','DNS','TCP','FTP'],1],
  ['software-engineering','Midterm','open-ended','Čemu služi kontrola verzija u timskom projektu?',undefined,undefined,'Beleži izmene, olakšava saradnju i rad u granama i omogućava vraćanje ranijih verzija.'],
  ['machine-learning','Exam','multiple-choice','Koja tehnika pomaže u proceni uspešnosti na do tada neviđenim podacima?',['Preprilagođavanje','Unakrsna validacija','Curenje podataka','Memorisanje'],1],
  ['security','Midterm','multiple-choice','Šta višefaktorska autentifikacija dodaje procesu prijavljivanja?',['Drugi nezavisni faktor provere','Duže korisničko ime','Bržu mrežu','Zajedničku lozinku'],0],
].map(([subjectId,examType,type,prompt,options,correctAnswer,sampleAnswer],i) => ({id:`q${i+1}`,subjectId,examType,type,prompt,options,correctAnswer,sampleAnswer,year:i%2?'2026':'2025'} as ExamQuestion));

// Data access boundary: replace these functions with Supabase queries later.
export async function getSubjects() { return subjects; }
export async function getSubject(id: string) { return subjects.find(s => s.id === id); }
export async function getMaterials(subjectId?: string) { return subjectId ? materials.filter(m => m.subjectId === subjectId) : materials; }
export async function getQuestions(subjectId?: string) { return subjectId ? questions.filter(q => q.subjectId === subjectId) : questions; }
