export function average(A: number[]): number | null {
  if (A.length === 0) return null;
  return A.reduce((a, b) => a + b) / A.length;
}

export function report(name: string, data: number[]) {
  console.log(`avg ${name} = `, average(data), "ms", `(${data.length})`);
  console.log('min', Math.min(...data));
  data.sort((a,b)=>a-b);
  for (let per of [50,75,90,95,99,99.5]) {
	console.log(per, data[Math.floor(data.length*per/100)]);
  }
  console.log('max', Math.max(...data));
}
