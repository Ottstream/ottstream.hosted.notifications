const mongoose = require('mongoose');
// const clientAddressSchema = require('./client_address.model');
const { Schema } = require('mongoose');
const { creditCardSchema } = require('../payment/credit_card/credit_card.model');
const { bankTransferSchema } = require('../payment/bank_transfer/bank_transfer.model');
const { toJSON, paginate } = require('../plugins');

const clientPaymentMethodSchema = mongoose.Schema(
  {
    paymentMethod: {
      type: Number,
      required: false,
      default: 0,
    },
    creditCard: creditCardSchema,
    bankTransfer: bankTransferSchema,
    default: {
      type: Boolean,
      required: false,
      default: false,
    },
    authorizeId: {
      type: String,
    },
    authorizeProviderId: {
      type: String,
    },
    authorizePaymentProfileId: {
      type: String,
    },
    cloverId: {
      type: String,
    },
    squareId: {
      type: String,
    },
    cloverSourceId: {
      type: String,
    },
    cloverProviderId: {
      type: String,
    },
    squareProviderId: {
      type: String,
    },
    squareSourceId: {
      type: String,
    },
    cloverPaymentProfileId: {
      type: String,
    },
    squarePaymentId: {
      type: String,
    },
    validationMessage: {
      type: String,
    },
    inUse: {
      type: Boolean,
      required: false,
      default: true,
    },
    isValid: {
      type: Boolean,
      required: false,
      default: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientPaymentMethodSchema.plugin(toJSON);
clientPaymentMethodSchema.plugin(paginate);

const ClientPaymentMethod = mongoose.model('ClientPaymentMethod', clientPaymentMethodSchema, 'client_payment_methods');
module.exports = ClientPaymentMethod;
