const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON } = require('../plugins');
const productIconSetItemSchema = require('./product_icon_set_item.model');

autoIncrement.initialize(mongoose.connection);
const { Schema } = mongoose;

const channelIconSet = mongoose.Schema(
  {
    setType: {
      type: Schema.Types.ObjectId,
    },
    setItems: [productIconSetItemSchema],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
channelIconSet.plugin(toJSON);

/**
 * @typedef channelSchema
 */
module.exports = channelIconSet;
