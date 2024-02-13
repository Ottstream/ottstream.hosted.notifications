const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const channelIconSetItemSchema = require('./channel_icon_set_item.model');

autoIncrement.initialize(mongoose.connection);
const { Schema } = mongoose;

const channelIconSet = mongoose.Schema(
  {
    setType: {
      type: Schema.Types.ObjectId,
      ref: 'ChannelIconSetType',
    },
    number: {
      type: Number,
      required: true,
      default: 1,
    },
    setItems: [channelIconSetItemSchema],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
channelIconSet.plugin(toJSON);
channelIconSet.plugin(paginate);
channelIconSet.plugin(autoIncrement.plugin, {
  model: 'ChannelIconSet',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});

/**
 * @typedef channelSchema
 */
// const channelIconSetScheme = mongoose.model('ChannelIconSet', channelIconSet, 'channel_icon_sets');

// channelIconSetScheme.collection.dropIndexes(function (err, results) {
//   // Handle errors
// });
// /**
//  * @typedef channelIconSetScheme
//  */

// module.exports = channelIconSetScheme;
