const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const validator = require('validator');
const autoIncrement = require('mongoose-auto-increment');
// const { autoIncrement } = require('mongoose-plugin-autoinc');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');
const { companyTypes } = require('../../config/company_types');
const translationSchema = require('../translation.model');
// eslint-disable-next-line no-unused-vars
const ottproviderAddressSchema = require('./ottprovider_address.model');
// eslint-disable-next-line no-unused-vars
const ottproviderSettingsSchema = require('./ottprovider_settings.model');
const ottproviderSalesTaxSchema = require('./ottprovider_sales_tax.model');
const ottproviderPermissionSchema = require('./ottprovider_permission.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const ottproviderSchema = mongoose.Schema(
  {
    name: [translationSchema],
    permission: {
      permissions: [ottproviderPermissionSchema],
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
    clientAmount: {
      type: Number,
      required: false,
    },
    channelAmount: {
      type: Number,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    syncIdentifier: {
      type: String,
      required: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    type: {
      type: Number,
      valid: companyTypes,
      required: true,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
      default: 1000,
    },
    middlewareId: {
      type: Number,
    },
    migrated: {
      type: Boolean,
      default: false,
    },
    migrationFails: [],
    number: {
      type: Number,
      required: true,
      default: 1,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    comment: {
      type: String,
      required: false,
    },
    priceGroup: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'PriceGroup',
    },
    country: {
      type: String,
      required: false,
    },
    timezone: {
      type: String,
      required: false,
    },
    status: {
      type: Number,
      required: false,
      default: 1, // 0 is hide from provider list
    },
    actionStatus: {
      type: String,
      required: false,
      default: 'enableAccess',
    },
    syncState: {
      type: Number,
      required: true,
      default: 2,
    },
    syncMessage: {
      type: String,
    },
    registerBy: { type: Schema.Types.ObjectId, ref: 'User' },
    editBy: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    settings: ottproviderSettingsSchema,
    salesTax: ottproviderSalesTaxSchema,
    hasValidTwilio: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidSmtp: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidPaymentGateway: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidShippingGateway: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidTelegramGateway: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidViberGateway: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidCheckeeper: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasValidPostalMethods: {
      type: Boolean,
      required: false,
      default: false,
    },
    paymentOptions: {
      cardsFee: {
        cardsCollectFeeProvider: {
          type: Boolean,
          required: false,
          default: false,
        },
        enabled: {
          type: Boolean,
          required: true,
          default: false, // autopay, cards, bank
        },
        fixed: {
          type: Number,
          required: false,
          default: 0,
        },
        percent: {
          type: Number,
          required: false,
          default: 0,
        },
      },
      bankFee: {
        bankCollectFeeProvider: {
          type: Boolean,
          required: false,
          default: false,
        },
        enabled: {
          type: Boolean,
          required: true,
          default: false, // autopay, cards, bank
        },
        fixed: {
          type: Number,
          required: false,
          default: 0,
        },
        percent: {
          type: Number,
          required: false,
          default: 0,
        },
      },
    },
    // payment_method: { type: Schema.Types.ObjectId, ref: 'PaymentMethod' },
  },
  {
    timestamps: true,
  }
);

ottproviderSchema.index({ user: 1 });
ottproviderSchema.index({ parent: 1 });
ottproviderSchema.index({ priceGroup: 1 });
// add plugin that converts mongoose to json
ottproviderSchema.plugin(toJSON);
ottproviderSchema.plugin(paginate);
ottproviderSchema.plugin(aggregatePaginate);
ottproviderSchema.plugin(autoIncrement.plugin, {
  model: 'OttProvider',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
// ottproviderSchema.plugin(autoIncrement, { model: 'OttProvider', field: 'number' });

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
ottproviderSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};
ottproviderSchema.pre('save', async function (next) {
  // const entity = this;
  // entity.number = getHash(entity.id);
  next();
});

/**
 * Increment client amount
 * @param {ObjectId} clientId
 */
ottproviderSchema.methods.incrementClientAmount = async function (clientId) {
  const user = this;
  // const isMatch = await user.isPasswordMatch(password);
  if (clientId) {
    user.clientAmount += 1;
    await user.save();
  }
};

/**
 * @typedef ottproviderSchema
 */
const OttProvider = mongoose.model('OttProvider', ottproviderSchema, 'ottproviders');
//
OttProvider.collection.dropIndex('email_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
module.exports = OttProvider;
