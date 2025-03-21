import Testbench from "./testbench";
import { randomBytes } from "node:crypto";

(async function () {
  for (let it = 0; it < 3; ++it) {
    console.log("starting");
    const t = new Testbench({
      duration: 1000,
      sources: [
        {
          interval: 10,
          pattern: () => randomBytes(100).toString("base64"),
          topic: "mytopic",
        },
      ],
    });
    const res = await t.start({ measureRtt: false });
    console.log("closed");
    console.error(res); // send to stderr
  }
  process.exit(0);
})();
