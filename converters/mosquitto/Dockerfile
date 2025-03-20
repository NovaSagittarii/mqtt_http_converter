FROM debian:stable-slim

RUN apt-get update && apt-get install -y \
  build-essential \
  cmake \
  libcurl4-openssl-dev \
  #  libcurl-dev \
   libcurlpp-dev\
  libmosquitto-dev \
  libmosquittopp-dev \
  libssl-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

ENV CXXFLAGS="-I/usr/include/openssl"
ENV LDFLAGS="-L/usr/lib -lssl -lcrypto"

RUN make print-flags

RUN make print-flags &&  make converter WITH_CJSON=no

CMD ["sh", "-c", "cat ./config.docker.txt | ./converter"]