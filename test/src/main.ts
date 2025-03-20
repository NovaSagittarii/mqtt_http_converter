import Testbench from "./testbench";
import { randomBytes } from "node:crypto";

const t = new Testbench({
  duration: 1000,
  sources: [
    {
      interval: 1,
      pattern: () => randomBytes(100).toString("base64"),
      topic: "random",
    },
  ],
});

t.start().then(() => {
  console.log("closed");
  process.exit(0);
});
