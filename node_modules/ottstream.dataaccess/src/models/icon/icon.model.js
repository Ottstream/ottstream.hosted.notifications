const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const iconSchema = mongoose.Schema(
  {
    name: [translationSchema],
    size: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: String,
      required: false,
    },
    base_url: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: String,
      required: false,
    },
    formats: [{ type: String }],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
iconSchema.plugin(toJSON);
iconSchema.plugin(paginate);

/**
 * @typedef iconSchema
 */
const Icon = mongoose.model('Icon', iconSchema, 'icons');

module.exports = Icon;
