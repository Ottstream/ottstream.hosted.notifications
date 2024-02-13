const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const clientBalanceCreditSchema = mongoose.Schema(
  {
    balance: { type: Schema.Types.ObjectId, ref: 'Balance' },
    credit: { type: Schema.Types.ObjectId, ref: 'Credit' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientBalanceCreditSchema.plugin(toJSON);

module.exports = clientBalanceCreditSchema;
