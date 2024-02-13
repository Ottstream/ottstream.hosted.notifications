const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const ottproviderSettingsSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: false,
    },
    channelMinCount: {
      type: Number,
      required: false,
    },
    channelMaxCount: {
      type: Number,
      required: false,
    },
    clientAmount: {
      type: Number,
      required: false,
    },
    dateFrom: {
      type: Date,
      required: false,
    },
    dateTo: {
      type: Date,
      required: false,
    },
    state: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderSettingsSchema.plugin(toJSON);

module.exports = ottproviderSettingsSchema;
