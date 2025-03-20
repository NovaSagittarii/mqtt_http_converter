#include <iostream>
#include <vector>

#include "converter.hh"

struct Config {
  struct Target {
    std::string topic;  // what to listen for
    std::string http;   // forward to here
  };
  std::string server;
  int port;
  std::vector<Target> targets;
};

int main() {
  Config config;
  // just pipe in input to stdin
  std::string w;
  std::cin >> w;
  if (w == "Server") {
    std::cin >> config.server >> config.port;
  }
  while (std::cin >> w) {
    if (w != "Topic") break;
    config.targets.push_back({});

    auto& target = config.targets.back();
    std::cin >> target.topic;

    std::cin >> w;
    if (w != "Send") break;
    std::cin >> target.http;
  }

  std::cout << "Starting up with " << config.targets.size() << " targets."
            << std::endl;

  MqttHttpConverter conv;
  for (auto& target : config.targets) {
    conv.AddRule(target.topic, target.http);
  }

  int res = conv.LoopForever(config.server, config.port);
  return res;
}