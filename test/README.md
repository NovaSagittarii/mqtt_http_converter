# MQTT to HTTP Converter Benchmark

1. Start mosquitto MQTT broker

   ```sh
   docker run --rm -it -p 1883:1883 eclipse-mosquitto
   ```

2. Start converter

   ```sh
   # change directory to /converters/mosquitto
   docker build -t conv .
   docker run -ti --rm --add-host=host.docker.internal:host-gateway conv
   ```

3. Start test `npm start`

### Setup (HTTP server)

Used node due to decent async performance.

```sh
npm i
npm start
```
