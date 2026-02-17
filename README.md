# action-wait-for-kafka-message
GitHub Action to wait until a deployed Kafka instance has traffic on a given topic, or timeout.

If a timeout happens, this will fail the workflow which should indicate that whatever intended publishing didn't not occur as expected.

## Usage

```yaml
- name: Wait for Kafka Traffic
  uses: ashfordhill/action-wait-for-kafka-message@main
  with:
    bootstrap_servers: 'localhost:9092'
    topic: 'my-important-topic'
    message_count: 5
    timeout_ms: 30000
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `bootstrap_servers` | Comma-separated list of Kafka brokers | Yes | - |
| `topic` | The Kafka topic to listen on | Yes | - |
| `message_count` | The number of messages to wait for | No | `1` |
| `timeout_ms` | Maximum time to wait in milliseconds | No | `60000` |
| `group_id` | Consumer group ID | No | `wait-kafka-action-group` |
