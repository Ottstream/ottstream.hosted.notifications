const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const packagePriceSchema = require('../package/package_price.model');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const subscriptionSchema = mongoose.Schema(
  {
    recurringPayment: {
      // depending on payment state this variable is changed so we know invoice is payed
      type: Boolean,
      required: false,
      default: true,
    },
    lastPaymentType: {
      type: String,
      required: false,
    },
    paymentState: {
      // depending on payment state this variable is changed so we know invoice is payed
      type: Number,
      required: false,
      default: 0,
    },
    state: {
      // state of subscription (to be paused, resumed)
      type: Number,
      required: false,
      default: 0,
    },
    hashes: [
      {
        type: String,
        required: false,
      },
    ],
    currentPriceGroup: {
      type: Schema.Types.ObjectId,
      ref: 'PriceGroup',
      required: false, // to fix the true in the future
    },
    currentDiscounts: [
      // current package discount list
      {
        type: Schema.Types.ObjectId,
        ref: 'ChannelPackageDiscount',
        required: true,
      },
    ],
    currentPrices: [packagePriceSchema],
    updates: [],
    subscriptionType: {
      type: String,
      required: true,
      default: 'toMaxDate',
    },
    leftInvoiceGenerated: {
      type: Boolean,
      required: true,
      default: false,
    },
    recurringPayed: {
      type: Boolean,
      required: true,
      default: false,
    },
    recurringDate: {
      type: Date,
    },
    recurringPayCount: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    room: {
      type: Number,
      required: true,
      default: 1,
    },
    migrated: {
      type: Boolean,
      required: false,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: false,
    },
    returnInvoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: false,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'ClientLocation',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
subscriptionSchema.index({ location: 1 });
subscriptionSchema.index({ invoice: 1 });
subscriptionSchema.index({ package: 1 });
subscriptionSchema.index({ client: 1 });
subscriptionSchema.index({ state: 1 });
subscriptionSchema.index({ state: 1, location: 1 });
subscriptionSchema.index({ location: 1, invoice: 1 });
subscriptionSchema.index({ location: 1, invoice: 1, client: 1 });
subscriptionSchema.index({ location: 1, invoice: 1, client: 1, package: 1 });

// add plugin that converts mongoose to json
subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

/**
 * @typedef subscriptionSchema
 */
const Subscription = mongoose.model('Subscription', subscriptionSchema, 'subscriptions');

module.exports = Subscription;
