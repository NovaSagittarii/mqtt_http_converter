Install dependencies

```
apt install libcurl-dev libcurlpp-dev
```

Building

```sh
make static_sub WITH_CJSON=no WITH_DOCS=no
make basic WITH_CJSON=no
make curlpp_example
make converter WITH_CJSON=no
```
