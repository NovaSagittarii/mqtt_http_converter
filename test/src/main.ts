import Testbench from "./testbench";
import { randomBytes } from "node:crypto";

const t = new Testbench({
  duration: 10000,
  sources: [
    {
      interval: 10,
      pattern: () => randomBytes(100).toString("base64"),
      topic: "random",
    },
  ],
});

t.start({ measureRtt: false }).then((res) => {
  console.log("closed");
  console.log(res);
  process.exit(0);
});
