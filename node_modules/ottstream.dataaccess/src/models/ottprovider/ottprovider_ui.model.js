const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ottproviderUiSchema = mongoose.Schema(
  {
    domain: {
      type: String,
      required: false,
    },
    dns: {
      type: String,
      required: false,
    },
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
ottproviderUiSchema.plugin(toJSON);
ottproviderUiSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderUi = mongoose.model('OttProviderUi', ottproviderUiSchema, 'ottprovider_ui');

module.exports = OttProviderUi;
