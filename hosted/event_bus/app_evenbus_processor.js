// schedule to generate invoices
const logger = require('../../utils/logger/logger');
// const serviceCollection = require('../../services/service_collection');
const {service} = require('ottstream.service');
const serviceCollection = service.collectionService;
// const balanceRepository = require('../../repository/payment/balance.repository');

class AppEventBusProcessor {
  constructor() {
    this.eventBusService = serviceCollection.getService('receiverEventBusService');
  }

  async processSocketStreams() {
    await this.eventBusService.connect();
    await this.eventBusService.subscribe('socket-stream', (message) => {
      const parsed = JSON.parse(message);
      const socketService = serviceCollection.getService('socketService');

      if (parsed.providerId) {
        socketService.sendToProvider(parsed.providerId, parsed.scope, parsed.data);
      } else if (parsed.userId) {
        socketService.sendToUser(parsed.userId, parsed.scope, parsed.data);
      } else if (parsed.group) {
        socketService.sendToGroup(parsed.group, parsed.scope, parsed.data);
      }

      // broadcast part
    });
    logger.info(`event bus: socket stream redis started...`);
  }
}

module.exports = AppEventBusProcessor;
