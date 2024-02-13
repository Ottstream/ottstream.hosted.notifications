const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const fileSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    mimetype: {
      type: String,
      required: false,
    },
    encoding: {
      type: String,
      required: false,
    },
    size: {
      type: Number,
      required: true,
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
fileSchema.plugin(toJSON);
fileSchema.plugin(paginate);

/**
 * @typedef fileSchema
 */
const File = mongoose.model('File', fileSchema, 'files');

module.exports = File;
