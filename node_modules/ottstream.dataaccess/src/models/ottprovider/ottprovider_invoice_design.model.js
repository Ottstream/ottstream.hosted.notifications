const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const ottproviderInvoiceDesignSchema = mongoose.Schema(
  {
    color: {
      type: String,
      required: false,
    },
    template: {
      type: String,
      required: false,
      default: 'template1',
      enum: ['template1'],
    },
    invoiceTitle: {
      type: String,
      required: false,
    },
    quoteTitle: {
      type: String,
      required: false,
    },
    creditNoteTitle: {
      type: String,
      required: false,
    },
    logo: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderInvoiceDesignSchema.plugin(toJSON);

/**
 * @typedef ottproviderSchema
 */

module.exports = ottproviderInvoiceDesignSchema;
