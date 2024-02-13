const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);
const { Schema } = mongoose;

const iconTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ratiox: {
      type: Number,
      required: false,
      default: 0,
    },
    ratioy: {
      type: Number,
      required: false,
      default: 0,
    },
    contour: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: false,
    },
    widths: [
      {
        type: Number,
      },
    ],
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
    number: {
      type: Number,
      required: true,
      default: 1,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
iconTypeSchema.plugin(toJSON);
iconTypeSchema.plugin(paginate);
iconTypeSchema.plugin(autoIncrement.plugin, {
  model: 'IconType',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});

// iconTypeSchema.plugin(autoIncrement, { model: 'IconType', field: 'number' });

/**
 * @typedef iconTypeSchema
 */
// const IconType = mongoose.model('IconType', iconTypeSchema, 'icon_types');
//
// module.exports = IconType;
