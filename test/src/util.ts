export function average(A: number[]): number {
  return A.reduce((a, b) => a + b) / A.length;
}

export function report(name: string, data: number[]) {
  console.log(`avg ${name} = `, average(data), "ms", `(${data.length})`);
}
