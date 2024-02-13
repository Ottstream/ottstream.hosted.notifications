const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const historySchema = mongoose.Schema(
  {
    table: {
      type: String,
      required: true,
    },
    fields: {
      type: Schema.Types.Mixed,
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
historySchema.plugin(toJSON);

/**
 * @typedef historySchema
 */
const History = mongoose.model('History', historySchema, 'histories');

module.exports = History;
