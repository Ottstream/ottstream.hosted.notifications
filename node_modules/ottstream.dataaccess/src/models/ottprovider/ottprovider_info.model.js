const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderInfoSchema = mongoose.Schema(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
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
ottproviderInfoSchema.plugin(toJSON);
ottproviderInfoSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderInfo = mongoose.model('OttProviderInfo', ottproviderInfoSchema, 'ottprovider_info');

module.exports = OttProviderInfo;
