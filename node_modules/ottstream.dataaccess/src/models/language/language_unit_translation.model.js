const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const languageUnitTranslationSchema = mongoose.Schema(
  {
    translation: {
      type: String,
      required: true,
      trim: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    unit: { type: Schema.Types.ObjectId, ref: 'LanguageUnit' },
    language: { type: Schema.Types.ObjectId, ref: 'Language' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
languageUnitTranslationSchema.plugin(toJSON);
// eslint-disable-next-line no-undef
languageUnitTranslationSchema.plugin(paginate);

/**
 * @typedef languageSchema
 */
// eslint-disable-next-line no-unused-vars
const LanguageUnitTranslation = mongoose.model(
  'LanguageUnitTranslation',
  languageUnitTranslationSchema,
  'language_unit_translation'
);

module.exports = LanguageUnitTranslation;
