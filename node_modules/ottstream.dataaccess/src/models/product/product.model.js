const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');
const productPriceSchema = require('./product_price.model');
const productOptions = require('./product_options.model');
const channelIconSet = require('./product_icon_set.model');

const { Schema } = mongoose;

const product = mongoose.Schema(
  {
    name: [translationSchema],
    description: [translationSchema],
    prices: [productPriceSchema],
    stock: {
      type: Number,
      required: false,
      default: 0,
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'ProductType',
    },
    state: {
      type: Number,
      required: false,
      default: 1,
    },
    isClient: {
      type: Boolean,
      required: true,
    },
    isResale: {
      type: Boolean,
      required: true,
    },
    options: [productOptions],
    icons: [channelIconSet],
    packageUnitDimensions: {
      type: Number,
      required: false,
    },
    packageDimensions: {
      type: Schema.Types.Mixed,
      required: false,
    },
    packageUnitWeight: {
      type: Number,
      required: false,
    },
    packageWeight: {
      type: Number,
      required: false,
    },
    information: {
      type: Schema.Types.Mixed,
      required: false,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    creationDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
product.plugin(toJSON);
product.plugin(paginate);

/**
 * @typedef package
 */
const productSchema = mongoose.model('Product', product, 'products');

module.exports = productSchema;
