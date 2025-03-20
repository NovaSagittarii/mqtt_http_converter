import mqtt from "mqtt";
import now from "performance-now";

export interface SourceConfig {
  /** milliseconds between requests */
  interval: number;

  /** data generation pattern callback */
  pattern: () => string;

  topic: string;
}

/**
 * A periodic data source
 */
export default class Source {
  /** milliseconds between requests */
  private interval: number;
  private pattern: () => string;
  private topic: string;

  public static client = mqtt.connect("mqtt://localhost:1883");
  public count: number = 0;
  private intervalId: NodeJS.Timeout | null = null;

  /** timestamps of when messages got sent */
  public timestamps: Record<string, number> = {};

  constructor({ interval, pattern, topic }: SourceConfig) {
    this.interval = interval;
    this.pattern = pattern;
    this.topic = topic;
  }

  start() {
    const run = () => {
      const payload = this.pattern();
      const t = now();
      Source.client.publish(this.topic, payload);
      ++this.count;
      this.timestamps[payload] = t;
    };
    run();
    this.intervalId = setInterval(run, this.interval);
  }

  stop() {
    clearInterval(this.intervalId ?? undefined);
  }
}
