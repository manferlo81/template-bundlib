export function sum(): 0
export function sum<N extends number>(a: N): N
export function sum(a: number, b: number): number
export function sum(...numbers: number[]): number
export function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}
