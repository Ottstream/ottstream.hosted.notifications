const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const invoiceSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    payed: {
      type: Number,
      required: true,
      default: 0,
    },
    newPayload: {
      type: Object,
    },
    parentPayed: {
      type: Boolean,
      required: true,
      default: false,
    },
    locationsExecuted: {
      type: Boolean,
      required: true,
      default: false,
    },
    postalMethodId: {
      type: String,
      required: false,
    },
    postalMethodStatus: {
      type: String,
      required: false,
    },
    shippingExecuted: {
      type: Boolean,
      required: true,
      default: false,
    },
    isShipping: {
      type: Boolean,
      required: false,
      default: false,
    },
    totalShipping: {
      type: Number,
      required: false,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    type: {
      type: Number,
      required: true,
      default: 1,
    },
    executionHash: {
      type: String,
      required: false,
    },
    payload: {
      type: Object,
      required: false,
    },
    payloadCalculated: {
      type: Object,
      required: false,
    },
    generateDisplayInfo: {
      type: Object,
      required: false,
    },
    payloadExecuted: {
      type: Boolean,
      required: true,
      default: false,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentType: {
      type: String,
    },
    isRefund: {
      type: Boolean,
      required: false,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    from_type: {
      type: Number,
      required: true,
      default: 1,
    },
    number: {
      type: String,
      required: false,
    },
    lastPaymentType: {
      type: String,
      required: false,
    },
    autopayment: {
      type: Boolean,
      required: false,
    },
    canceledExecuted: {
      type: Boolean,
      required: false,
      default: false,
    },
    from_client: { type: Schema.Types.ObjectId, ref: 'Client' },
    from_provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    to_type: {
      type: Number,
      required: true,
      default: 1,
    },
    to_provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    to_client: { type: Schema.Types.ObjectId, ref: 'Client' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider', index: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
    location: { type: Schema.Types.ObjectId, ref: 'ClientLocation', index: true },
    shipping: { type: Schema.Types.ObjectId, ref: 'Shipping', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    sentUser: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
invoiceSchema.plugin(toJSON);
invoiceSchema.plugin(paginate);
invoiceSchema.plugin(aggregatePaginate);

/**
 * @typedef invoiceSchema
 */
const Invoice = mongoose.model('Invoice', invoiceSchema, 'invoices');

module.exports = Invoice;
