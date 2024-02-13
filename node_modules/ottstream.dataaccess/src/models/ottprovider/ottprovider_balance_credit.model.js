const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderBalanceCreditSchema = mongoose.Schema(
  {
    balanceAmount: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    autopayCollectFeeClient: {
      type: Boolean,
      required: false,
    },
    cards: {
      type: String,
      required: false,
    },
    cardsCollectFeeClient: {
      type: Boolean,
      required: false,
    },
    bank: {
      type: String,
      required: false,
    },
    bankCollectFeeClient: {
      type: Boolean,
      required: false,
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
    },
    stripe: {
      secretKey: {
        type: String,
        required: false,
      },
      publicKey: {
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
ottproviderBalanceCreditSchema.plugin(toJSON);
ottproviderBalanceCreditSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderBalanceCredit = mongoose.model(
  'OttProviderBalanceCredit',
  ottproviderBalanceCreditSchema,
  'ottprovider_balance_credit'
);

module.exports = OttProviderBalanceCredit;
