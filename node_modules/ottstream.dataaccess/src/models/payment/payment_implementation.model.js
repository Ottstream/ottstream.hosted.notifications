const mongoose = require('mongoose');
const { paginate, toJSON } = require('../plugins');

const { Schema } = mongoose;

const paymentImplementationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
      required: true,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
paymentImplementationSchema.plugin(toJSON);
paymentImplementationSchema.plugin(paginate);

/**
 * @typedef paymentImplementationSchema
 */
const PaymentImplementation = mongoose.model(
  'PaymentImplementation',
  paymentImplementationSchema,
  'payment_implementations'
);

module.exports = PaymentImplementation;
