const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const ottproviderInvoiceSettingsSchema = mongoose.Schema(
  {
    dateFormat: {
      type: String,
      required: false,
    },
    timezone: {
      type: String,
      required: false,
    },
    postalMethod: {
      type: String,
      required: false,
    },
    returnEnvelope: {
      type: Boolean,
      required: false,
    },
    currency: {
      type: String,
      required: false,
    },
    language: {
      type: String,
      required: false,
    },
    paperFormat: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    autosend: {
      type: Number,
      required: false,
    },
    invoiceGenerateDay: {
      type: Number,
      required: false,
      default: 1,
    },
    phone: {
      type: Schema.Types.ObjectId,
      ref: 'OttProviderPhone',
    },
    email: {
      type: Schema.Types.ObjectId,
      ref: 'OttProviderEmail',
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'OttProviderAddress',
    },
    comment: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderInvoiceSettingsSchema.plugin(toJSON);

/**
 * @typedef ottproviderSchema
 */

module.exports = ottproviderInvoiceSettingsSchema;
