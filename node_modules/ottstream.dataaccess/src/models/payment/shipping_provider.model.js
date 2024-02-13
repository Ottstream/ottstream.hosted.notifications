const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const shippingProviderSchema = mongoose.Schema(
  {
    providerOrders: {
      type: String,
      required: true,
    },
    clientsOrder: {
      type: String,
      required: true,
    },
    productionToken: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      required: true,
    },
    apiSecret: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
shippingProviderSchema.plugin(toJSON);

/**
 * @typedef shippingProviderSchema
 */
const ShippingProvider = mongoose.model('shippingProvider', shippingProviderSchema, 'shipping_provider');

module.exports = ShippingProvider;
