const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const clientPersonalInfoSchema = require('./client_personal_info.model');
const clientPhoneSchema = require('./client_phone.model');
const clientEmailSchema = require('./client_email.model');
const clientFinanceSchema = require('./client_finance.model');
const clientAddressSchema = require('./client_address.model');
const clientBalanceCreditSchema = require('./client_balance_credit.model');
const clientDeviceSchema = require('./client_rent_devices.model');
const clientSettingsSchema = require('./client_settings.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const clientSchema = mongoose.Schema(
  {
    personalInfo: clientPersonalInfoSchema,
    phones: [clientPhoneSchema],
    emails: [clientEmailSchema],
    addresses: [clientAddressSchema],
    finance: clientFinanceSchema,
    balanceCredit: clientBalanceCreditSchema,
    rentDevices: clientDeviceSchema,
    settings: clientSettingsSchema,
    currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
    // paymentMethod: [{ type: Schema.Types.ObjectId, ref: 'ClientPaymentMethod' }],
    subscriptionRecurringPayment: {
      type: String,
      required: false,
      default: null,
    },
    subscriptionActivationDate: {
      type: Date,
      required: false,
    },
    subscriptionPendingDate: {
      type: Date,
      required: false,
    },
    subscriptionState: {
      type: Number,
      required: false,
      default: 0,
    },
    lastPaymentMethod: {
      type: String,
      required: false,
      default: null,
    },
    monthlyPayments: {
      type: String,
      required: false,
      default: null,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    debt: {
      type: Number,
      required: true,
      default: 0,
    },
    migrated: {
      type: Boolean,
      default: false,
    },
    keywords: {
      type: Object,
    },
    comment: {
      type: String,
      required: false,
      default: '',
    },
    middlewareId: {
      type: String,
      required: false,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    expired: {
      type: Boolean,
      required: false,
      default: false,
    },
    subscriptionCancelDate: {
      type: Date,
      required: false,
    },
    number_id: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: Number,
      required: false,
      default: 1, // 0 is hide from client list
    },
    // extendedType: {
    //   type: Number,
    //   required: false,
    //   default: 0, // 0 false, 1 true
    // },
    // actionStatus: {
    //   type: String,
    //   required: false,
    //   default: 'unblock client',
    // },
    user: { type: Schema.Types.ObjectId, ref: 'User' },

    paymentMethods: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ClientPaymentMethod',
        index: true,
      },
    ],
    credits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Credit',
        index: true,
      },
    ],
    info: {
      type: Object,
      default: {
        locations: [],
      },
      required: true,
    },
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ClientLocation',
        index: true,
      },
    ],
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
clientSchema.plugin(toJSON);
clientSchema.plugin(paginate);
clientSchema.plugin(aggregatePaginate);
clientSchema.plugin(autoIncrement.plugin, {
  model: 'Client',
  field: 'number_id',
  startAt: 1,
  incrementBy: 1,
});

/**
 * Check if email is taken
 * @param {string} email - The client's email
 * @returns {Promise<boolean>}
 */
clientSchema.statics.isEmailTaken = async function (email) {
  const client = await this.findOne({ 'emails.email': email, status: 1 });
  return !!client;
};

/**
 * Check if phone is taken
 * @param {string} phone - The client's phone
 * @returns {Promise<boolean>}
 */
clientSchema.statics.isPhoneTaken = async function (phone) {
  const escapedPhone = phone.replace(/\+/g, '\\+');
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(`^${escapedPhone}$`);
  const user = await this.findOne({ 'phones.phone': regex, status: 1 });
  return !!user;
};

/**
 * @typedef clientSchema
 */
const Client = mongoose.model('Client', clientSchema, 'clients');

// eslint-disable-next-line no-unused-vars
Client.collection.dropIndexes(function () {
  // Handle errors
});
module.exports = Client;
