const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const channelIconSchema = mongoose.Schema(
  {
    iconSet: {
      type: Schema.Types.ObjectId,
      ref: 'ChannelIconSet',
      required: true,
    },
    setName: {
      type: String,
      required: true,
    },
    iconType: {
      type: Schema.Types.ObjectId,
      ref: 'IconType',
      required: false,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
channelIconSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

// module.exports = channelIconSchema;
