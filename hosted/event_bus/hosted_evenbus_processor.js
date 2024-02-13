// schedule to generate invoices
const queue = require('queue');
const logger = require('../../utils/logger/logger');
// const serviceCollection = require('../../services/service_collection');
// const TwilioService = require('../../services/sms/twilio.service');
const {service} = require('ottstream.service');
const serviceCollection = service.collectionService;
const TwilioService = service.socketWsService;
class HostedEventBusProcessor {
  constructor() {
    this.eventBusService = serviceCollection.getService('receiverEventBusService');
    this.webhookQueue = queue({ results: [], autostart: true, timeout: 0, concurrency: 1 });
  }

  addToQueue(data) {
    logger.info(`twilioarrived 1`);
    if (this.webhookQueue && this.webhookQueue.length) {
      logger.warn(`twiliowebhook in queue: please wait`);
    } else {
      logger.warn(`twiliowebhook have been added to queue`);
    }
    this.webhookQueue.push((cb) => TwilioService.processTwilioWebhook(data, cb));
  }

  async processSocketStreams() {
    await this.eventBusService.connect();
    await this.eventBusService.subscribe('telegram-bot', (message) => {
      const parsed = JSON.parse(message);
      if (parsed.action === 'run') {
        const { credentials, providerId } = parsed;

        if (credentials && credentials.isValid) {
          const telegramBotService = serviceCollection.getService('telegramBotService');
          const isRunning = telegramBotService.isRunning(providerId, credentials.authToken);
          if (!isRunning) {
            telegramBotService.runBot(providerId, credentials.authToken);
          }
        }
      } else if (parsed.action === 'stop') {
        const { credentials, providerId } = parsed;

        const telegramBotService = serviceCollection.getService('telegramBotService');
        telegramBotService.stopBot(providerId, credentials.authToken);
      } else {
        const telegramBotService = serviceCollection.getService('telegramBotService');
        telegramBotService.processTelegramWebhook(parsed.body);
      }
      // broadcast part
    });

    await this.eventBusService.subscribe('twilio', async (message) => {
      const parsed = JSON.parse(message);
      this.addToQueue(parsed.body);
    });
    logger.info(`event bus: socket stream redis started...`);
  }
}

module.exports = HostedEventBusProcessor;
