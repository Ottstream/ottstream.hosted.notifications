const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const clientBillSchema = mongoose.Schema(
  {
    billNumber: {
      type: Number,
      required: false,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: false,
    },
    upcomingManual: {
      type: Number,
      required: false,
      default: 1,
    },
    typeClients: {
      type: Number,
      required: false,
      enum: [1, 2],
      // Own Clients, Reseller Clients
    },
    reseller: {
      type: String,
      required: false,
    },
    autoPayment: {
      type: Number,
      required: false,
      enum: [1, 2, 3],
      // all, disabled, enabled
    },
    paymentStatus: {
      type: Number,
      required: false,
      enum: [1, 2, 3, 4, 5, 6],
      // canceled, paid, refunded, unpaid, upcoming, declined
    },
    paymentAction: {
      type: Number,
      required: false,
      enum: [1, 2, 3, 4],
      // all, provider, client, parent
    },
    paymentMethod: {
      type: Number,
      required: false,
      enum: [1, 2, 3, 4, 5],
      // all, card, bank, cash, moneyOrder
    },
    billSendMethod: {
      type: Number,
      required: false,
      enum: [1, 2, 3, 4],
      // don't send, postalMethod, mail, email
    },
    billInfoType: {
      type: Number,
      required: false,
      enum: [1, 2],
      // balance, subscriptions
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
clientBillSchema.plugin(toJSON);
clientBillSchema.plugin(paginate);
clientBillSchema.plugin(aggregatePaginate);

/**
 * @typedef clientBillSchema
 */
const ClientBill = mongoose.model('ClientBill', clientBillSchema, 'client_bill');

module.exports = ClientBill;
