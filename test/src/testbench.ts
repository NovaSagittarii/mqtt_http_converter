import express from "express";
import Source, { SourceConfig } from "./source";
import now from "performance-now";
import { average, report } from "./util";

interface TestbenchConfig {
  /** length of test in milliseconds */
  duration: number;

  sources: SourceConfig[];
}

interface TestbenchRunConfig {
  measureRtt?: boolean;
}

interface TestbenchResult {
  packets: number;
  latency: number;
  rtt: number;
  rps: number;
}

export default class Testbench {
  private duration: number;
  private sources: Source[];

  constructor({ duration, sources }: TestbenchConfig) {
    this.duration = duration;
    this.sources = sources.map((c) => new Source(c));

    console.log(sources);
  }

  async start({ measureRtt = true }: TestbenchRunConfig = {}) {
    console.log("Run for ", this.duration, "ms");

    let rtt: number[] = [];
    if (measureRtt) {
      Source.client.subscribe({
        "#": {
          qos: 0,
        },
      });
    }
    const handleMqttMessage = (
      _topic: string,
      buffer: Buffer,
      _packet: any,
    ) => {
      const t = now();
      const [pt, _] = this.getTime(buffer.toString("utf8"));
      if (pt) {
        // console.log("RTT ", t - pt, "ms");
        rtt.push(t - pt);
      }
    };
    Source.client.on("message", handleMqttMessage);

    return new Promise<TestbenchResult | null>((resolve) => {
      let isFinished = false;
      let remainingSources = 0;
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
          // console.log("latency =", t - pt, "ms", source);
          latency.push(t - pt);
          --source.pending;
          if (isFinished) {
            if (source.pending <= 0) {
              if (--remainingSources <= 0) {
                await cleanupCallback();
              }
            }
          }
        }
      });

      const server = app.listen(3000);
      cleanupCallback = async () => {
        cleanupCallback = async () => {}; // run once
        let results = null;
        await Promise.allSettled([
          new Promise((resolve) => server.close(resolve)),
          new Promise<void>((resolve) => {
            const totalCount = this.sources
              .map((s) => s.count)
              .reduce((a, b) => a + b);
            const rps = totalCount / (this.duration / 1000);
            console.log("sent ", totalCount, "packets");
            console.log("RPS=", rps.toFixed(2));
            report("latency", latency);
            report("RTT    ", rtt);
            results = {
              packets: totalCount,
              latency: average(latency),
              rtt: average(rtt),
              rps,
            } as TestbenchResult;
            resolve();
          }),
          // wait for any slow RTT requests before stopping
          new Promise((resolve) => setTimeout(resolve, 100)),
        ]);

        Source.client.unsubscribe("#");
        Source.client.off("message", handleMqttMessage);
        resolve(results);
      };

      this.sources.forEach((s) => s.start());
      setTimeout(async () => {
        this.sources.forEach((s) => s.stop());
        isFinished = true;
        let times = this.sources.map((s) => Object.keys(s.timestamps).length);
        let remain = times.reduce((a, b) => a + b);
        remainingSources = this.sources.filter((x) => x).length;
        if (!remain) {
          await cleanupCallback();
        }
        setTimeout(cleanupCallback, 100); // ignore dropped packets
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
