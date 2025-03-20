#include <iostream>
#include <vector>

struct Config {
  struct Target {
    std::string topic;  // what to listen for
    std::string http;   // forward to here
  };
  std::string server;
  std::vector<Target> targets;
};

int main() {
  Config config;
  // just pipe in input to stdin
  std::string w;
  std::cin >> w;
  if (w == "Server") {
    std::cin >> config.server;
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
}