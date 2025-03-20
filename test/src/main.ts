import Testbench from "./testbench";

const t = new Testbench({
  duration: 1000,
  sources: [
    {
      interval: 1,
      pattern: () => Math.random().toString(36).slice(2),
      topic: "random",
    },
  ],
});

t.start().then(() => {
  console.log("closed");
  process.exit(0);
});
