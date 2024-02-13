const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const languageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Country',
    },
    selected: {
      type: Boolean,
      required: true,
      default: 0,
    },
    // units: [languageUnitTranslationSchema],
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
languageSchema.plugin(toJSON);
languageSchema.plugin(paginate);

/**
 * @typedef languageSchema
 */
const Language = mongoose.model('Language', languageSchema, 'languages');

module.exports = Language;
