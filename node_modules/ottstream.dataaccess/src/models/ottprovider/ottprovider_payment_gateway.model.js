const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderPaymentGatewaySchema = mongoose.Schema(
  {
    autopay: {
      type: String,
      required: false,
    },
    autopayInterval: {
      type: Number,
      required: false,
    },
    autopayRetryCount: {
      type: Number,
      required: false,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    autopayCollectFeeClient: {
      type: Boolean,
      required: false,
      default: false,
    },
    cards: {
      type: String,
      required: false,
    },
    cardsCollectFeeClient: {
      type: Boolean,
      required: false,
      default: false,
    },
    bank: {
      type: String,
      required: false,
    },
    bankCollectFeeClient: {
      type: Boolean,
      required: false,
      default: false,
    },
    // Payment Merchant
    autoPayFee: {
      enabled: {
        type: Boolean,
        required: true,
        default: false, // autopay, cards, bank
      },
      isValid: {
        type: Boolean,
        default: false, // autopay, cards, bank
      },
      fixed: {
        type: Number,
        required: false,
        default: 0,
      },
      percent: {
        type: Number,
        required: false,
        default: 0,
      },
    },
    cardsFee: {
      enabled: {
        type: Boolean,
        required: true,
        default: false, // autopay, cards, bank
      },
      fixed: {
        type: Number,
        required: false,
        default: 0,
      },
      percent: {
        type: Number,
        required: false,
        default: 0,
      },
    },
    bankFee: {
      enabled: {
        type: Boolean,
        required: true,
        default: false, // autopay, cards, bank
      },
      fixed: {
        type: Number,
        required: false,
        default: 0,
      },
      percent: {
        type: Number,
        required: false,
        default: 0,
      },
    },
    authorize: {
      apiLoginId: {
        type: String,
        required: false,
      },
      transactionKey: {
        type: String,
        required: false,
      },
      currentSignatureKey: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
        required: true,
        default: false,
      },
      message: {
        type: String,
        required: false,
      },
    },
    paypal: {
      username: {
        type: String,
        required: false,
      },
      password: {
        type: String,
        required: false,
      },
      signature: {
        type: String,
        required: false,
      },
      isValid: {
        type: Boolean,
        required: true,
        default: false,
      },
      message: {
        type: String,
        required: false,
      },
    },
    stripe: {
      isValid: {
        type: Boolean,
        required: true,
        default: false,
      },
      message: {
        type: String,
        required: false,
      },
      secretKey: {
        type: String,
        required: false,
      },
      publicKey: {
        type: String,
        required: false,
      },
    },
    clover: {
      isValid: {
        type: Boolean,
        required: true,
        default: false,
      },
      message: {
        type: String,
        required: false,
      },
      secretKey: {
        type: String,
        required: false,
      },
      merchantId: {
        type: String,
        required: false,
      },
    },
    square: {
      isValidApplicationId: {
        type: Boolean,
        required: true,
        default: false,
      },
      isValid: {
        type: Boolean,
        required: true,
        default: false,
      },
      isProduction: {
        type: Boolean,
        default: false,
      },
      secretKey: {
        type: String,
        required: false,
      },
      applicationId: {
        type: String,
        required: false,
      },
      locationId: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderPaymentGatewaySchema.plugin(toJSON);
ottproviderPaymentGatewaySchema.plugin(paginate);

ottproviderPaymentGatewaySchema.index({ providerId: 1 });
/**
 * @typedef ottproviderSchema
 */
const OttProviderPaymentGateway = mongoose.model(
  'OttProviderPaymentGateway',
  ottproviderPaymentGatewaySchema,
  'ottprovider_payment_gateway'
);

module.exports = OttProviderPaymentGateway;
