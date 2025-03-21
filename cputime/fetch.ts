const query = `query=rate%28container_cpu_usage_seconds_total%7Bname%3D%22converter%22%7D%5B10m%5D%29`;
fetch("http://localhost:9090/api/v1/query?" + query)
  .then((x) => x.json())
  .then((json) => {
    const cputimes = json.data.result.map((x: any) => +x.value[1]) as number[];
    const total = cputimes.reduce((a, b) => a + b, 0);
    console.log(total);
  });
