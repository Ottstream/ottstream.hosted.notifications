const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const creditSchema = mongoose.Schema(
  {
    startNow: {
      type: Boolean,
      required: false,
      default: false,
    },
    creditAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    creditStartDate: {
      type: Date,
      required: false,
    },
    creditTerm: {
      type: Number,
      required: false,
    },
    days: {
      type: Boolean,
      required: false,
      default: false,
    },
    months: {
      type: Boolean,
      required: false,
      default: false,
    },
    clientsPauseAfterDays: {
      type: Number,
      required: false,
      default: 1,
    },
    creditComment: {
      type: String,
      required: false,
    },
    creditAutoextend: {
      type: Boolean,
      required: false,
      default: false,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      required: false,
      index: true,
    },
    paymentState: {
      type: Number,
      default: 2, // 2 = unpayed, 1 = payed, 0 = returned
      required: true,
    },
    state: {
      type: Number, // 1 = working, 0 = stoped
      required: true,
      default: 1,
    },
    inCheckout: {
      type: Boolean, // credit provided during checkout
      required: false,
      default: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
creditSchema.plugin(toJSON);
creditSchema.plugin(paginate);

/**
 * @typedef creditSchema
 */
const Credit = mongoose.model('Credit', creditSchema, 'credits');

module.exports = Credit;
