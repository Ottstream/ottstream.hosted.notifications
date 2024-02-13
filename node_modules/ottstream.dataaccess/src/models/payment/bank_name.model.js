const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const bankNameSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
bankNameSchema.plugin(toJSON);
bankNameSchema.plugin(paginate);

/**
 * @typedef creditSchema
 */
const BankName = mongoose.model('BankName', bankNameSchema, 'bank_names');

module.exports = BankName;
