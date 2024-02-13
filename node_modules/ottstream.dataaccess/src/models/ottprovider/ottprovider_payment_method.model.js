const mongoose = require('mongoose');
require('validator');
const { toJSON, paginate } = require('../plugins');
const { creditCardSchema } = require('../payment/credit_card/credit_card.model');
const { bankTransferSchema } = require('../payment/bank_transfer/bank_transfer.model');

const { Schema } = mongoose;

const paymentMethodSchema = mongoose.Schema(
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
    inUse: {
      type: Boolean,
      required: false,
      default: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
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
 * @typedef ottproviderSchema
 */
const OttProviderPaymentMethod = mongoose.model(
  'OttProviderPaymentMethod',
  paymentMethodSchema,
  'ottprovider_payment_methods'
);
OttProviderPaymentMethod.collection.dropIndex('cardNumber_1', { sparse: true }, function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
OttProviderPaymentMethod.collection.dropIndex('bankTransfer.accountNumber_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
/**
 * @typedef paymentMethodSchema
 */

module.exports = OttProviderPaymentMethod;
