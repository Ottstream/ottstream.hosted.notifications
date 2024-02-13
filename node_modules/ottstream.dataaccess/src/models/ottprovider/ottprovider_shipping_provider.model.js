const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderShippingProviderSchema = mongoose.Schema(
  {
    provider_default: {
      type: String,
      required: false,
    },
    client_default: {
      type: String,
      required: false,
    },
    easyship: {
      productionToken: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
        required: false,
      },
    },
    shiprocket: {
      email: {
        type: String,
        required: false,
      },
      password: {
        type: String,
        required: false,
      },
    },
    shipstation: {
      apiKey: {
        type: String,
        required: false,
      },
      apiSecret: {
        type: String,
        required: false,
      },
    },
    goshippo: {
      apiToken: {
        type: String,
        required: false,
      },
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderShippingProviderSchema.plugin(toJSON);
ottproviderShippingProviderSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderShippingProvider = mongoose.model(
  'OttProviderShippingProvider',
  ottproviderShippingProviderSchema,
  'ottprovider_shipping_provider'
);

module.exports = OttProviderShippingProvider;
