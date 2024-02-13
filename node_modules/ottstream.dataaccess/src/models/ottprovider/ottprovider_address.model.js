const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderAddressSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: false,
      trim: false,
    },
    lastname: {
      type: String,
      required: false,
      trim: false,
    },
    companyName: {
      type: String,
      required: false,
    },
    company: {
      type: Boolean,
      required: false,
      default: false,
    },
    // personal: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
    officeName: {
      type: String,
      required: false,
    },
    phone: {
      number: { type: String },
      countryCode: { type: String },
    },
    address: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
      trim: false,
    },
    city: {
      type: String,
      required: false,
      trim: false,
    },
    unit: {
      type: String,
      required: false,
      // trim: false,
    },
    state: {
      type: String,
      required: false,
      // trim: false,
    },
    zip: {
      type: String,
      required: false,
      trim: false,
    },
    isBilling: {
      type: Boolean,
      required: false,
      default: false,
    },
    inUse: {
      type: Boolean,
      required: false,
      default: true,
    },
    isMain: {
      type: Boolean,
      required: false,
      default: false,
    },
    isForShipping: {
      type: Boolean,
      required: false,
      default: false,
    },
    forInvoice: {
      type: Boolean,
      required: false,
      default: false,
    },
    isWarehouse: {
      type: Boolean,
      required: false,
      default: false,
    },
    acceptSelfPickup: {
      type: Boolean,
      required: false,
      default: false,
    },
    acceptCurrierPickup: {
      type: Boolean,
      required: false,
      default: false,
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
ottproviderAddressSchema.plugin(toJSON);
ottproviderAddressSchema.plugin(paginate);
// ottproviderAddressSchema.index({ isMain: 1, providerId: 1 }, { unique: true });

/**
 * @typedef ottproviderSchema
 */
const OttProviderAddress = mongoose.model('OttProviderAddress', ottproviderAddressSchema, 'ottprovider_address');
/**
 * @typedef ottproviderAddressSchema
 */
OttProviderAddress.collection.dropIndex('address_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
module.exports = OttProviderAddress;
