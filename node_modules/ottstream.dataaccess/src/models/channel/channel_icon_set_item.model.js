const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const channelIconSetItemSchema = mongoose.Schema(
  {
    iconType: {
      type: Schema.Types.ObjectId,
      ref: 'IconType',
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: false,
    },
    originalImage: { type: Schema.Types.ObjectId, ref: 'File', required: false },
    changedImage: { type: Schema.Types.ObjectId, ref: 'File', required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
channelIconSetItemSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

// module.exports = channelIconSetItemSchema;
