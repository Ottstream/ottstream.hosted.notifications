const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const permissionSchema = mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
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
permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

/**
 * @typedef permissionSchema
 */
const Permission = mongoose.model('Permission', permissionSchema, 'permissions');

module.exports = Permission;
