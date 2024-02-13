const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const paymentGatewaySchema = mongoose.Schema(
  {
    autopay: {
      type: String,
      required: true,
    },
    autopayInterval: {
      type: Number,
      required: false,
    },
    autopayRetryCount: {
      type: Number,
      required: false,
    },
    cards: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    collectFreeFromClient: {
      type: Boolean,
      required: true,
      default: false,
    },
    apiLoginId: {
      type: String,
      required: true,
      default: '3Pzaf68Ep',
    },
    transactionKey: {
      type: String,
      required: true,
      default: '9r8N4A66rjwg2T95',
    },
    currentSignatureKey: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
      index: { unique: true },
    },
    password: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: false,
    },
    secretKey: {
      type: String,
      required: false,
    },
    publicKey: {
      type: String,
      required: true,
      default: 'pk_live_7rB4zJhquOrd3eeOMFPX8D7J',
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
paymentGatewaySchema.plugin(toJSON);
paymentGatewaySchema.plugin(paginate);

/**
 * @typedef paymentGatewaySchema
 */
const PaymentGateway = mongoose.model('PaymentGateway', paymentGatewaySchema, 'payment_gateways');

module.exports = PaymentGateway;
