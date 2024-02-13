const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const productDiscount = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    percent: {
      type: Number,
      required: true,
      default: 0,
    },
    round: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    productPriceGroup: { type: Schema.Types.ObjectId, ref: 'ProductPriceGroup' },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
    currencyCountry: { type: Schema.Types.ObjectId, ref: 'CurrencyCountry' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productDiscount.plugin(toJSON);
productDiscount.plugin(paginate);

/**
 * @typedef package
 */
const productDiscountSchema = mongoose.model('ProductDiscount', productDiscount, 'product_discounts');

module.exports = productDiscountSchema;
