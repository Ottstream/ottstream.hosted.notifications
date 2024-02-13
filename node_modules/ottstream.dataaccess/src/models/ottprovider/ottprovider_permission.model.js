const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

const ottproviderPermissionSchema = mongoose.Schema(
  {
    permission: {
      type: String,
      required: false,
      trim: false,
    },
    name: [translationSchema],
    onOff: {
      type: Boolean,
      required: false,
      default: true,
    },
    onOffChild: {
      type: Boolean,
      required: false,
      default: true,
    },
    state: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ottproviderPermissionSchema.plugin(toJSON);
ottproviderPermissionSchema.plugin(paginate);
// ottproviderPermissionSchema.index({ isMain: 1, providerId: 1 }, { unique: true });

module.exports = ottproviderPermissionSchema;
