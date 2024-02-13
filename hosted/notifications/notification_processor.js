// schedule to generate invoices
const cron = require('node-cron');
const { repositories } = require('ottstream.dataaccess');
const logger = require('../../utils/logger/logger');
const config = require('../../config/config');
// eslint-disable-next-line no-unused-vars
const {service} = require('ottstream.service');
const NotificationRepository = service.notificationService
const { commentRepository } = repositories;
// const NotificationRepository = require('../../services/notification/notification.service');


// eslint-disable-next-line no-unused-vars
const processComments = async () => {
  // TODO generate notification of comment and send to user
  // eslint-disable-next-line no-empty
  try {
    // get list of comments which are not notified and is time to notify
    const comments = await commentRepository.getComments({
      notified: false,
      sendNotification: true,
      reminderDate: {
        $lte: new Date().toUTCString(),
      },
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const comment of comments) {
      // eslint-disable-next-line no-await-in-loop
      const notification = await NotificationRepository.GenerateCommentNotification(comment);
      if (notification) {
        // eslint-disable-next-line no-await-in-loop
        await commentRepository.updateCommentById(comment._id.toString(), {
          notified: true,
          notification: notification._id.toString(),
        });
      }
    }
    logger.info(`cron job: processing notifications: comments to notify: ${comments.length}`);
  } catch (exception) {
    logger.error(exception, true);
  }
};

const notificationProcessorCronWorker = async () => {
  if (config.hosted.processNotifications) {
    logger.info(`cron job: processing subscriptions..`);
    await processComments();
  }
};

const notificationProcessorCron = async () => {
  const callMinutes = '*/1 * * * *';
  await notificationProcessorCronWorker();
  cron.schedule(callMinutes, async () => {
    await notificationProcessorCronWorker();
  });
};

module.exports = {
  notificationProcessorCron,
};
