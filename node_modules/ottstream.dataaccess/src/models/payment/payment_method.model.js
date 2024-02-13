const mongoose = require('mongoose');
const { paginate, toJSON } = require('../plugins');

const paymentMethodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
      required: true,
    },
    oneTime: {
      type: Boolean,
      required: true,
      default: false,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
paymentMethodSchema.plugin(toJSON);
paymentMethodSchema.plugin(paginate);

/**
 * @typedef paymentMethodSchema
 */
const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema, 'payment_methods');

module.exports = PaymentMethod;
