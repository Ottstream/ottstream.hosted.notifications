const mongoose = require('mongoose');
const { toJSON } = require('../plugins');
const ottProviderCategoryChannelItemSchema = require('./ottprovider_category_channel_item.model');

const { Schema } = mongoose;

const ottProviderCategoryChannelSchema = mongoose.Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: 'ChannelCategory' },
    channels: [ottProviderCategoryChannelItemSchema],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottProviderCategoryChannelSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = ottProviderCategoryChannelSchema;
