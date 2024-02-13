const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

const { Schema } = mongoose;

const priceGroupSchema = mongoose.Schema(
  {
    name: [translationSchema],
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    type: {
      type: Number, // client type or provider
      required: true,
      default: 1,
    },
    percent: {
      type: Number,
      required: false,
      default: 0,
    },
    round: {
      type: Number,
      required: false,
      default: 1,
    },
    digits: {
      type: Number,
      required: false,
      default: 1,
    },
    migrated: {
      type: Boolean,
      required: false,
    },
    default: {
      type: Boolean,
      default: false,
    },
    middlewareId: {
      type: String,
      default: false,
    },
    providerMiddlewareId: {
      type: String,
      default: false,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
priceGroupSchema.plugin(toJSON);
priceGroupSchema.plugin(paginate);

/**
 * @typedef priceGroupSchema
 */
const PriceGroup = mongoose.model('PriceGroup', priceGroupSchema, 'price_groups');

module.exports = PriceGroup;
