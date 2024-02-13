const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const invoiceSettings = require('./ottprovider_invoice_settings.model');
const invoiceDesign = require('./ottprovider_invoice_design.model');

const { Schema } = mongoose;

const ottproviderInvoiceSchema = mongoose.Schema(
  {
    settings: invoiceSettings,
    design: invoiceDesign,
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
ottproviderInvoiceSchema.plugin(toJSON);
ottproviderInvoiceSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderInvoice = mongoose.model('OttProviderInvoice', ottproviderInvoiceSchema, 'ottprovider_invoice');

module.exports = OttProviderInvoice;
