const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const phoneSchema = mongoose.Schema(
  {
    inUse: {
      type: Boolean,
      required: false,
      default: true,
    },
    isMain: {
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
    isMobile: {
      type: Boolean,
      required: false,
      default: false,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    number: {
      type: String,
      required: true,
      unique: false,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Check if phone is taken
 * @param {string} phone - The user's phone
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
phoneSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ number: phone, _id: { $ne: excludeUserId } });
  if (excludeUserId && user && user.providerId && user.providerId.toString() === excludeUserId) {
    return false;
  }
  return !!user;
};

// add plugin that converts mongoose to json
phoneSchema.plugin(toJSON);
phoneSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderPhone = mongoose.model('OttProviderPhone', phoneSchema, 'ottprovider_phones');
/**
 * @typedef phoneSchema
 */

// eslint-disable-next-line no-unused-vars
OttProviderPhone.collection.dropIndex('number_1', function (err, results) {
  // Handle errors
});

module.exports = OttProviderPhone;
