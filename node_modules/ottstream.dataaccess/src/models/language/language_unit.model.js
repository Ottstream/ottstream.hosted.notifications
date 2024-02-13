const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const languageUnitSchema = mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
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
languageUnitSchema.plugin(toJSON);
languageUnitSchema.plugin(paginate);

/**
 * @typedef languageUnitSchema
 */
const LanguageUnit = mongoose.model('LanguageUnit', languageUnitSchema, 'language_units');

module.exports = LanguageUnit;
