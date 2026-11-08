export function srCount(value: number, one: string, few: string, many: string) {
  const lastTwo = value % 100;
  const last = value % 10;
  const form = lastTwo >= 11 && lastTwo <= 14 ? many : last === 1 ? one : last >= 2 && last <= 4 ? few : many;
  return `${value} ${form}`;
}
