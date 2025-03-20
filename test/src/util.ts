export function average(A: number[]): number {
  return A.reduce((a, b) => a + b) / A.length;
}
