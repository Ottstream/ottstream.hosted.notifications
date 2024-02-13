const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const config = require('./config/config');
const logger = require('./utils/logger/logger');
const { middlewareSyncCron } = require('./hosted/middleware_sync/middleware_sync_processor');
const { notificationProcessorCron } = require('./hosted/notifications/notification_processor');

const HostedEventBusProcessor = require('./hosted/event_bus/hosted_evenbus_processor');

const eventBusProcessor = new HostedEventBusProcessor();
eventBusProcessor
  .processSocketStreams()
  .then(() => {})
  .catch(() => {});
// const {
//   basicUserRoles,
//   basicOttProvider,
//   defaultChannelIconSet,
//   defaultIconType,
//   supportedPaymentMethods,
//   supportedPaymentImplementations,
// } = require('./utils/startup');

const connectDB = () => {
  mongoose
    .connect(config.mongoose.url, config.mongoose.options)
    .then(async () => {
      logger.info('Connected to MongoDB');

      // delete all collections
      // await Promise.all(
      //   Object.values(mongoose.connection.collections).map(async (collection) => {
      //     collection.deleteMany();
      //   })
      // );
      autoIncrement.initialize(mongoose.connection);
    })
    .catch((error) => {
      logger.error(error);
      connectDB();
    });
};

connectDB();

// running cron job for invoices
notificationProcessorCron().then(() => {});

if (!config.sync.sync_middleware) {
  logger.warn(`syncing middleware is disabled`);
} else {
  middlewareSyncCron().then(() => {});
}

const exitHandler = () => {};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
});
