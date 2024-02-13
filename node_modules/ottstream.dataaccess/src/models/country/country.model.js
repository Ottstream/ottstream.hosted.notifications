const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const countrySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 1,
    },
    code: {
      type: String,
      required: true,
      default: 1,
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
countrySchema.plugin(toJSON);
countrySchema.plugin(paginate);

/**
 * @typedef countrySchema
 */
const Country = mongoose.model('Country', countrySchema, 'countries');

module.exports = Country;
