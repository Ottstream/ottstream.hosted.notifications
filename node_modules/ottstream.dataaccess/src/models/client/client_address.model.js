const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientAddressSchema = mongoose.Schema(
  {
    existingName: {
      type: Boolean,
      required: false,
      default: true,
    },
    firstname: {
      type: String,
      required: false,
      trim: false,
      index: true,
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
    phone: {
      type: String,
      required: false,
      trim: false,
    },
    address: {
      type: String,
      required: false,
      trim: false,
      index: true,
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
    validationMessage: {
      type: String,
      required: false,
      trim: false,
    },
    validationObject: {
      type: Object,
      required: false,
    },
    image: {
      type: String,
      required: false,
      trim: false,
    },
    isValid: {
      type: Boolean,
      required: false,
      trim: false,
    },
    suite: {
      type: String,
      required: false,
      trim: false,
    },
    lat: {
      type: Number,
      required: false,
    },
    long: {
      type: Number,
      required: false,
    },
    province: {
      type: String,
      required: false,
      trim: false,
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
    isShipping: {
      type: Boolean,
      required: false,
      default: false,
    },
    isResident: {
      type: Boolean,
      required: false,
    },
    forContactInvoice: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientAddressSchema.plugin(toJSON);

module.exports = clientAddressSchema;
