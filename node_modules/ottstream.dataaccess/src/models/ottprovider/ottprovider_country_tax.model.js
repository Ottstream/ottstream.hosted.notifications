const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const ottproviderCountryTaxSchema = mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    countryState: {
      type: String,
      required: false,
    },
    serviceTaxPercent: {
      type: Number,
      required: false,
      trim: false,
      min: 0,
      max: 100,
    },
    productTaxPercent: {
      type: Number,
      required: true,
      trim: false,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderCountryTaxSchema.plugin(toJSON);

module.exports = ottproviderCountryTaxSchema;
