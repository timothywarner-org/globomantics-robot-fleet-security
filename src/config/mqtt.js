const mqtt = require('mqtt');
const logger = require('../utils/logger');

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME || 'globomantics';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || 'robot-fleet-2024';

const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  clientId: `globomantics-fleet-mgmt-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
});

mqttClient.on('error', (error) => {
  logger.error('MQTT connection error:', error);
});

mqttClient.on('offline', () => {
  logger.warn('MQTT client offline');
});

mqttClient.on('reconnect', () => {
  logger.info('MQTT client reconnecting...');
});

module.exports = mqttClient;