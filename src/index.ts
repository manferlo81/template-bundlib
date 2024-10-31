export function sum(a: number, b: number): number;
export function sum(a: number, ...more: number[]): number;
export function sum(a: number, b: number, ...more: number[]): number {
  return more.reduce((acc, num) => acc + num, a + b);
}
