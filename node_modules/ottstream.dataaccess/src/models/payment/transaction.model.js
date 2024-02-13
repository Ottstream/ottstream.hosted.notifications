const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { paginate, toJSON } = require('../plugins');

const { Schema } = mongoose;

const transactionSchema = mongoose.Schema(
  {
    hash: {
      type: String,
      required: false,
    },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    payload: {
      type: Object,
      required: false,
    },
    sourcePay: {
      type: Object,
      requirxed: false,
    },
    payloadExecuted: {
      type: Boolean,
      required: true,
      default: false,
    },
    balanceHistory: {
      type: Object,
      required: false,
    },
    executionDate: {
      type: Date,
      required: false,
    },
    stateMessage: {
      type: String,
      required: false,
    },
    isRefund: {
      type: Boolean,
      required: false,
    },
    checkeeper: {
      type: Object,
      required: false,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    number: {
      type: String,
      required: false,
    },
    transactionId: {
      type: String,
      required: false,
    },
    payloadError: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    fixed: {
      type: Boolean,
      required: false,
    },
    autopayment: {
      type: Boolean,
      required: false,
    },
    voidable: {
      type: Boolean,
      required: false,
    },
    transaction_type: {
      type: String,
      required: true,
      // enum: ['B_TO_B', 'C_TO_A', 'TO_B'],
    },
    source_type: {
      type: String,
      required: true,
      // enum: ['INVOICE', 'PAY_BALANCE', 'ADD_BALANCE', 'ADD_CREDIT', 'PAY_CREDIT', 'VOID_TRANSACTION'],
    },
    from_type: {
      type: Number,
      required: true,
      default: 1,
    },
    from_client: { type: Schema.Types.ObjectId, ref: 'Client' },
    from_provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    to_type: {
      type: Number,
      required: true,
      default: 1,
    },
    to_client: { type: Schema.Types.ObjectId, ref: 'Client' },
    to_provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ from_client: 1 });
transactionSchema.index({ from_provider: 1 });
transactionSchema.index({ to_client: 1 });
transactionSchema.index({ to_provider: 1 });
transactionSchema.index({ transaction_type: 1 });
transactionSchema.index({ invoice: 1 });
transactionSchema.index({ provider: 1 });

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);
transactionSchema.plugin(aggregatePaginate);
/**
 * @typedef transactionSchema
 */
const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');

Transaction.collection.dropIndex('from_provider_1_from_client_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
Transaction.collection.dropIndex('from_provider_1_to_client_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
Transaction.collection.dropIndex('to_provider_1_to_client_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
Transaction.collection.dropIndex('to_provider_1_from_client_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
Transaction.collection.dropIndex('user_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
module.exports = Transaction;
