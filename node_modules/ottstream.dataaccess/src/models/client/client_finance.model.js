const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const clientFinanceSchema = mongoose.Schema(
  {
    currency: {
      type: Schema.Types.ObjectId,
      ref: 'currencySchema',
    },
    priceGroup: {
      type: Schema.Types.ObjectId,
      ref: 'PriceGroup',
    },
    forPackages: {
      type: String,
      reqyured: false,
      ref: 'ClientPaymentMethod',
    },
    forDevicesRent: {
      type: String,
      required: false,
      default: 'none',
    },
    paperlessBilling: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientFinanceSchema.plugin(toJSON);

module.exports = clientFinanceSchema;
