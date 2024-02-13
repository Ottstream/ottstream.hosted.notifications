const mongoose = require('mongoose');
const { toJSON } = require('../../plugins');

const bankTransferSchema = mongoose.Schema(
  {
    bankName: {
      type: String,
      required: false,
    },
    routingNumber: {
      type: Number,
      required: false,
    },
    accountNumber: {
      type: String,
      required: false,
    },
    companyName: {
      type: String,
      required: false,
    },
    personalData: {
      firstname: { type: String, required: false },
      lastname: { type: String, required: false },
      nickname: { type: String, required: false },
    },
    account: {
      type: String,
      required: false,
    },
    // businessAccount: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
bankTransferSchema.plugin(toJSON);

/**
 * @typedef bankTransferSchema
 */
module.exports = {
  bankTransferSchema,
};
