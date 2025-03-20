#pragma once

#include <string>
#include <vector>

class MqttHttpConverter {
 public:
  MqttHttpConverter() {}
  void AddRule(const std::string& topic, const std::string& forward_to);
  int LoopForever(const std::string& host, int port) const;

  const auto& rules() const { return rules_; }

 private:
  struct Rule {
    std::string topic, forward_to;
    void Send(char* data, int len) const;
  };
  std::vector<Rule> rules_;
};
