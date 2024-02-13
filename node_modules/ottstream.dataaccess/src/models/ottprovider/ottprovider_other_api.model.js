const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderOtherApiSchema = mongoose.Schema(
  {
    ivr: {
      apiToken: {
        type: String,
        required: false,
      },
    },
    ring: {
      apiToken: {
        type: String,
        required: false,
      },
    },
    checkeeper: {
      apiToken: {
        type: String,
        required: false,
      },
      secret: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
      },
      bankAccount: {
        type: String,
        required: false,
      },
      companyAddress: {
        type: String,
        required: false,
      },
      companyName: {
        type: String,
        required: false,
      },
      routingNumber: {
        type: String,
        required: false,
      },
      signatureImage: {
        type: String,
        required: false,
      },
      templateName: {
        type: String,
        required: false,
      },
    },
    smarty: {
      key: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
        required: false,
      },
    },
    postal: {
      secretKey: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
        required: false,
      },
    },
    taxJar: {
      apiToken: {
        type: String,
        required: false,
      },
    },
    twilio: {
      sId: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
      },
      authToken: {
        type: String,
        required: false,
      },
      fromNumber: {
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
ottproviderOtherApiSchema.plugin(toJSON);
ottproviderOtherApiSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderOtherApi = mongoose.model('OttProviderOtherApi', ottproviderOtherApiSchema, 'ottprovider_other_api');

module.exports = OttProviderOtherApi;
