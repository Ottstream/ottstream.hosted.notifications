const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const discountNotificationSchema = mongoose.Schema(
  {
    beforeDays: {
      type: Number,
      required: false,
      default: 0,
    },
    repeatDays: {
      type: Number,
      required: false,
      default: 0,
    },
    notificationTextForUpcoming: {
      type: String,
      required: false,
    },
    notificationTextForCurrent: {
      type: String,
      required: false,
    },
    notificationsMode: {
      type: String,
      required: false,
      default: 'manualOnly',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
discountNotificationSchema.plugin(toJSON);

module.exports = discountNotificationSchema;
