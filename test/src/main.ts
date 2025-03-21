import Testbench from "./testbench";
import { randomBytes } from "node:crypto";

(async function () {
  for (let it = 0; it < 1; ++it) {
    console.log("starting");
    const t = new Testbench({
      duration: 10000,
      sources: [
        {
          interval: 5,
          pattern: () => randomBytes(100).toString("base64"),
          topic: "mytopic",
        },
      ],
    });
    const res = await t.start({ measureRtt: false });
    console.log("closed");
    console.error(JSON.stringify(res)); // send to stderr
  }
  process.exit(0);
})();
