#include "converter.hh"

#include <curl/curl.h>
#include <mosquitto.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// see sub.c (or mosquitto/examples/subscribe) for documentation

static const MqttHttpConverter *active_converter = nullptr;

void on_connect(struct mosquitto *mosq, void *obj, int reason_code) {
  int rc;
  printf("on_connect: %s\n", mosquitto_connack_string(reason_code));
  if (reason_code != 0) {
    mosquitto_disconnect(mosq);
  }

  rc = mosquitto_subscribe(mosq, NULL, "#", 1);
  if (rc != MOSQ_ERR_SUCCESS) {
    fprintf(stderr, "Error subscribing: %s\n", mosquitto_strerror(rc));
    mosquitto_disconnect(mosq);
  }
}

void on_subscribe(struct mosquitto *mosq, void *obj, int mid, int qos_count,
                  const int *granted_qos) {
  int i;
  bool have_subscription = false;

  for (i = 0; i < qos_count; i++) {
    printf("on_subscribe: %d:granted qos = %d\n", i, granted_qos[i]);
    if (granted_qos[i] <= 2) {
      have_subscription = true;
    }
  }
  if (have_subscription == false) {
    fprintf(stderr, "Error: All subscriptions rejected.\n");
    mosquitto_disconnect(mosq);
  }
}

void on_message(struct mosquitto *mosq, void *obj,
                const struct mosquitto_message *message) {
  // printf("%s %d %s\n", msg->topic, msg->qos, (char *)msg->payload);
  bool res;
  for (auto &rule : active_converter->rules()) {
    mosquitto_topic_matches_sub(rule.topic.c_str(), message->topic, &res);
    if (res) {
      rule.Send((char *)message->payload, message->payloadlen);
    }
  }
}

// For suppressing post req
// https://stackoverflow.com/a/59874052
static size_t write_callback(char *ptr, size_t size, size_t nmemb,
                             void *userdata) {
  /*
  size_t written = fwrite(ptr, size, nmemb, static_cast<FILE*>(userdata));
  return written;
  */
  return size * nmemb;
}

void MqttHttpConverter::AddRule(const std::string &topic,
                                const std::string &forward_to) {
  MqttHttpConverter::Rule rule;
  rule.topic = topic;
  rule.forward_to = forward_to;
  rules_.push_back(rule);
}

int MqttHttpConverter::LoopForever(const std::string &host, int port) const {
  active_converter = this;

  curl_global_init(CURL_GLOBAL_ALL);
  mosquitto_lib_init();

  struct mosquitto *mosq = mosquitto_new(NULL, true, NULL);
  if (mosq == NULL) {
    fprintf(stderr, "Error: Out of memory.\n");
    return 1;
  }

  mosquitto_connect_callback_set(mosq, on_connect);
  mosquitto_subscribe_callback_set(mosq, on_subscribe);
  mosquitto_message_callback_set(mosq, on_message);

  int rc = mosquitto_connect(mosq, host.c_str(), port, 60);
  if (rc != MOSQ_ERR_SUCCESS) {
    mosquitto_destroy(mosq);
    fprintf(stderr, "Error: %s\n", mosquitto_strerror(rc));
    return 1;
  }

  mosquitto_loop_forever(mosq, -1, 1);

  mosquitto_lib_cleanup();
  curl_global_cleanup();

  return 0;
}

void MqttHttpConverter::Rule::Send(char *data, int len) const {
  CURL *curl = curl_easy_init();
  struct curl_slist *headers = NULL;

  if (curl) {
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, nullptr);

    curl_easy_setopt(curl, CURLOPT_URL, forward_to.c_str());
    headers = curl_slist_append(headers, "Expect:");
    headers = curl_slist_append(headers, "Content-Type: text/plain");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, len);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);

    CURLcode res = curl_easy_perform(curl);
    if (res != CURLE_OK)
      fprintf(stderr, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));

    curl_easy_cleanup(curl);
  }
}