const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const _packageChannel = mongoose.Schema(
  {
    sampleOption: {
      type: Number,
      required: false,
    },
    channelMiddlewareId: {
      type: Number,
      required: false,
    },
    packageMiddlewareId: {
      type: Number,
      required: false,
    },
    package: { type: Schema.Types.ObjectId, ref: 'Package' },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
_packageChannel.plugin(toJSON);
_packageChannel.plugin(paginate);
_packageChannel.plugin(aggregatePaginate);
_packageChannel.plugin(autoIncrement.plugin, {
  model: 'packageSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef package
 */
const packageChannelSchema = mongoose.model('PackageChannel', _packageChannel, 'package_channels');

module.exports = packageChannelSchema;
