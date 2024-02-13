const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientPackageItemSchema = mongoose.Schema(
  {
    dayMonth: {
      type: String,
      required: false,
    },
    stop: {
      type: String,
      required: false,
    },
    subscribeToEndOfMaxExpire: {
      type: String,
      required: false,
    },
    globalAction: {
      type: Number,
      required: false,
      default: 0,
    },
    subscribeDayMonthType: {
      type: String,
      required: false,
    },
    subscribeToDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientPackageItemSchema.plugin(toJSON);

module.exports = clientPackageItemSchema;
