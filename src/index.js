const core = require('@actions/core');
const { Kafka } = require('kafkajs');

async function run() {
  try {
    const bootstrapServers = core.getInput('bootstrap_servers', { required: true });
    const topic = core.getInput('topic', { required: true });
    const targetCount = parseInt(core.getInput('message_count') || '1', 10);
    const timeoutMs = parseInt(core.getInput('timeout_ms') || '60000', 10);
    const groupId = core.getInput('group_id') || 'wait-kafka-action-group';

    const kafka = new Kafka({
      clientId: 'wait-kafka-action',
      brokers: bootstrapServers.split(',').map(s => s.trim()),
    });

    const consumer = kafka.consumer({ groupId });
    let messageCounter = 0;
    let isFinished = false;

    const timeout = setTimeout(async () => {
      if (!isFinished) {
        isFinished = true;
        await consumer.disconnect();
        core.setFailed(`Timed out waiting for ${targetCount} messages on topic ${topic} after ${timeoutMs}ms. Found ${messageCounter} messages.`);
      }
    }, timeoutMs);

    await consumer.connect();

    let subscribed = false;
    while (!subscribed && !isFinished) {
      try {
        await consumer.subscribe({ topic, fromBeginning: false });
        subscribed = true;
        console.log(`Successfully subscribed to topic: ${topic}`);
      } catch (error) {
        if (error.name === 'KafkaJSProtocolError' && error.code === 3) {
          console.log(`Topic ${topic} not found, retrying in 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }

    if (isFinished) return;

    console.log(`Listening for ${targetCount} messages on topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (isFinished) return;
        
        messageCounter++;
        console.log(`Received message ${messageCounter}/${targetCount}`);

        if (messageCounter >= targetCount) {
          isFinished = true;
          clearTimeout(timeout);
          await consumer.disconnect();
          console.log(`Successfully received ${messageCounter} messages.`);
        }
      },
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
