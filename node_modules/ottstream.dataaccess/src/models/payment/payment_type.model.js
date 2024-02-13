const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const paymentTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
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
paymentTypeSchema.plugin(toJSON);
paymentTypeSchema.plugin(paginate);

/**
 * @typedef paymentTypeSchema
 */
const PaymentType = mongoose.model('PaymentType', paymentTypeSchema, 'payment_types');

module.exports = PaymentType;
