const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const emailSchema = mongoose.Schema(
  {
    inUse: {
      type: Boolean,
      required: false,
      default: true,
    },
    isMain: {
      type: Boolean,
      required: false,
    },
    isInfo: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSupport: {
      type: Boolean,
      required: false,
      default: false,
    },
    forInvoice: {
      type: Boolean,
      required: false,
      default: false,
    },
    forSend: {
      type: Boolean,
      required: false,
      default: false,
    },
    smtp: {
      ssl: {
        type: Boolean,
        required: false,
      },
      isValid: {
        type: Boolean,
        required: false,
      },
      server: { type: String, required: false },
      port: { type: Number, min: 1, max: 65534, required: false },
      username: { type: String, required: false },
      password: { type: String, required: false },
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    address: {
      type: String,
      required: false,
      unique: false,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
emailSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ address: email, _id: { $ne: excludeUserId } });
  if (excludeUserId && user && user.providerId && user.providerId.toString() === excludeUserId) {
    return false;
  }
  return !!user;
};

// add plugin that converts mongoose to json
emailSchema.plugin(toJSON);
emailSchema.plugin(paginate);

/**
/**
 * @typedef ottproviderSchema
 */
const OttProviderEmail = mongoose.model('OttProviderEmail', emailSchema, 'ottprovider_emails');
/**
 * @typedef emailSchema
 */
// eslint-disable-next-line no-unused-vars
OttProviderEmail.collection.dropIndex('address_1', function (err, results) {
  // Handle errors
});

module.exports = OttProviderEmail;
