const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;
autoIncrement.initialize(mongoose.connection);

const channelIconSetTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    number: {
      type: Number,
      required: true,
      default: 1,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
channelIconSetTypeSchema.plugin(toJSON);
channelIconSetTypeSchema.plugin(paginate);
channelIconSetTypeSchema.plugin(autoIncrement.plugin, {
  model: 'ChannelIconSetType',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});

/**
 * @typedef channelIconSetTypeSchema
 */
// const ChannelIconSetType = mongoose.model('ChannelIconSetType', channelIconSetTypeSchema, 'channel_icon_set_types');
//
// module.exports = ChannelIconSetType;
