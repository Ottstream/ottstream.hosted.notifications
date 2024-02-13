const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const _package = mongoose.Schema(
  {
    name: [translationSchema],
    description: [translationSchema],
    middlewareId: {
      type: Number,
      required: false,
    },
    middlewareName: [translationSchema],
    vEnable: {
      type: Number,
      required: false,
      default: false,
    },
    aEnable: {
      type: Number,
      required: false,
      default: false,
    },
    tEnable: {
      type: Number,
      required: false,
      default: false,
    },
    type: {
      type: Number,
      default: 1,
      enum: [1, 2],
    },
    state: {
      type: Number,
      default: 1,
      enum: [0, 1, 2],
    },
    forClients: {
      type: Boolean,
      default: true,
    },
    forResale: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Number,
      default: 1,
      enum: [0, 1, 2],
    },
    channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

_package.index({ provider: 1 });
// add plugin that converts mongoose to json
_package.plugin(toJSON);
_package.plugin(paginate);
_package.plugin(aggregatePaginate);
_package.plugin(autoIncrement.plugin, {
  model: 'packageSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef package
 */
const packageSchema = mongoose.model('Package', _package, 'packages');

module.exports = packageSchema;
