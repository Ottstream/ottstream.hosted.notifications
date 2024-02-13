const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

const { Schema } = mongoose;

const productType = mongoose.Schema(
  {
    name: [translationSchema],
    identifier: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
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
productType.plugin(toJSON);
productType.plugin(paginate);

/**
 * @typedef package
 */
const productTypeSchema = mongoose.model('ProductType', productType, 'product_types');

module.exports = productTypeSchema;
