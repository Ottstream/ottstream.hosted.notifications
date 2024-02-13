const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const ottProviderCategoryChannelItemSchema = mongoose.Schema(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
    },
    order: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

ottProviderCategoryChannelItemSchema.pre('save', function (next) {
  if (!this.order) this.order = this.get('_id'); // considering _id is input by client
  next();
});

// add plugin that converts mongoose to json
ottProviderCategoryChannelItemSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = ottProviderCategoryChannelItemSchema;
