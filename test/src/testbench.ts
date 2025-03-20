import express from "express";
import Source, { SourceConfig } from "./source";
import now from "performance-now";
import { average } from "./util";

interface TestbenchConfig {
  /** length of test in milliseconds */
  duration: number;

  sources: SourceConfig[];
}

export default class Testbench {
  private duration: number;
  private sources: Source[];

  constructor({ duration, sources }: TestbenchConfig) {
    this.duration = duration;
    this.sources = sources.map((c) => new Source(c));

    console.log(sources);
  }

  async start() {
    console.log("Run for ", this.duration, "ms");

    let rtt: number[] = [];
    Source.client.subscribe("#");
    Source.client.on("message", (_topic, buffer, _packet) => {
      const t = now();
      const [pt, _] = this.getTime(buffer.toString("utf8"));
      if (pt) {
        // console.log("RTT ", t - pt, "ms");
        rtt.push(t - pt);
      }
    });

    return new Promise<void>((resolve) => {
      let isFinished = false;
      let cleanupCallback = async () => {};
      let latency: number[] = [];

      const app = express();
      app.post("/", express.text(), async (req, res) => {
        const t = now();
        // console.log(req.body);
        res.status(200).send("ok");

        const payload = req.body;
        let [pt, source] = this.getTime(payload);
        if (pt && source) {
          // console.log("latency =", t - pt, "ms");
          latency.push(t - pt);
          delete source.timestamps[payload];
          if (isFinished) {
            await cleanupCallback();
          }
        }
      });

      const server = app.listen(3000);
      cleanupCallback = async () => {
        await Promise.allSettled([
          new Promise((resolve) => server.close(resolve)),
          new Promise<void>((resolve) => {
            console.log("avg latency =", average(latency), "ms");
            console.log("avg RTT     =", average(rtt), "ms");
            resolve();
          }),
        ]);
        resolve();
      };

      this.sources.forEach((s) => s.start());
      setTimeout(async () => {
        this.sources.forEach((s) => s.stop());
        isFinished = true;
        let remain = this.sources
          .map((s) => Object.keys(s.timestamps).length)
          .reduce((a, b) => a + b);
        if (!remain) {
          await cleanupCallback();
        }
      }, this.duration);
    });
  }

  getTime(payload: string): [number, Source] | [null, null] {
    for (const source of this.sources) {
      const pt = source.timestamps[payload];
      if (pt) {
        return [pt, source];
      }
    }
    return [null, null];
  }
}
