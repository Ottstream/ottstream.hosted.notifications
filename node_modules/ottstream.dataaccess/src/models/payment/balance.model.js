const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const balanceSchema = mongoose.Schema({
  method: {
    type: Number,
    required: false,
    default: 0,
  },
  moneyOrder: {
    type: Number,
    required: false,
  },
  checkNumber: {
    type: Number,
    required: false,
  },
  balance: {
    type: Number,
    required: false,
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'OttProvider',
    required: false,
    index: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: false,
    index: true,
  },
  comment: {
    type: String,
    required: false,
  },
});
// add plugin that converts mongoose to json
balanceSchema.plugin(toJSON);
balanceSchema.plugin(paginate);

/**
 * @typedef balanceSchema
 */
const Balance = mongoose.model('Balance', balanceSchema, 'balances');

module.exports = Balance;
