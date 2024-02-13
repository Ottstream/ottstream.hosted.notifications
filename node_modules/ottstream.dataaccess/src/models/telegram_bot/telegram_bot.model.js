const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');

const telegramBot = mongoose.Schema(
  {
    botId: {
      type: String,
      required: false,
    },
    users: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
telegramBot.plugin(toJSON);
telegramBot.plugin(paginate);
telegramBot.plugin(aggregatePaginate);
/**
 * @typedef telegramBot
 */
const telegramBotSchema = mongoose.model('TelegramBot', telegramBot, 'telegram_bots');

module.exports = telegramBotSchema;
