const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const systemVariableSchema = mongoose.Schema(
  {
    formats: [
      {
        type: String,
      },
    ],
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
systemVariableSchema.plugin(toJSON);
systemVariableSchema.plugin(paginate);

/**
 * @typedef systemVariableSchema
 */
const SystemVariable = mongoose.model('SystemVariable', systemVariableSchema, 'system_variables');

module.exports = SystemVariable;
