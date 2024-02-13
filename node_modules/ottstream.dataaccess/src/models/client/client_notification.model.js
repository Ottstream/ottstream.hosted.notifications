const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientNotificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    info: {
      type: String,
      required: true,
      trim: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientNotificationSchema.plugin(toJSON);

/**
 * Check if email is taken
 * @param {string} email - The client's email
 * @param {ObjectId} [excludeClientId] - The id of the client to be excluded
 * @returns {Promise<boolean>}
 */

/**
 * Check if password matches the client's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */

module.exports = clientNotificationSchema;
