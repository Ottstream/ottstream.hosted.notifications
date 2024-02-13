const mongoose = require('mongoose');
const { toJSON } = require('../plugins');
const ottproviderCountryTaxSchema = require('./ottprovider_country_tax.model');

const ottproviderSalesTaxSchema = mongoose.Schema(
  {
    serviceTaxByApi: {
      type: Boolean,
      required: false,
      default: false,
    },
    serviceTaxPercent: {
      type: Number,
      trim: false,
      required: false,
      min: 0,
      max: 100,
    },
    productTaxByApi: {
      type: Boolean,
      required: false,
      default: false,
    },
    productTaxPercent: {
      type: Number,
      required: false,
      trim: false,
      min: 0,
      max: 100,
    },
    countryTax: [ottproviderCountryTaxSchema],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderSalesTaxSchema.plugin(toJSON);

module.exports = ottproviderSalesTaxSchema;
