const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../plugins');

const { Schema } = mongoose;

// Mongoose passes the raw value in MongoDB `email` to the getter

const creditCardSchema = mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: false,
      min: 0,
      max: 20,
    },
    cardholderName: {
      type: String,
      required: false,
      trim: false,
    },
    anExistingAddress: {
      type: Boolean,
      required: false,
      default: false,
    },
    existingAddress: { type: String, required: false },
    billingAddress: {
      state: { type: String, required: false },
      suite: { type: String, required: false, trim: false },
      address: { type: String, required: false, trim: false },
      country: { type: String, required: false, trim: false },
      city: { type: String, required: false, trim: false },
      zip: { type: String, required: false, trim: false },
      phone: { type: String, required: false },
    },
    cvc: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    month: {
      type: String,
      required: false,
    },
    year: {
      type: String,
      required: false,
    },
    brand: {
      type: String,
      required: false,
      default: 'visa',
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    selectedAddress: { type: Schema.Types.ObjectId, ref: 'OttProviderAddress' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
creditCardSchema.plugin(toJSON);
creditCardSchema.plugin(paginate);

/**
 * @typedef creditCardSchema
 */
const CreditCard = mongoose.model('CreditCard', creditCardSchema, 'credit_card');

module.exports = {
  creditCardSchema,
  CreditCard,
};
