const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: Number,
      default: 1,
      required: true,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

/**
 * @typedef roleSchema
 */
const Role = mongoose.model('Role', roleSchema, 'roles');

module.exports = Role;
