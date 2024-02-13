const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const ageGroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      default: '',
    },
    from: {
      type: Number,
      required: true,
      default: 1,
    },
    to: {
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
ageGroupSchema.plugin(toJSON);
ageGroupSchema.plugin(paginate);

/**
 * @typedef ageGroupSchema
 */
const AgeGroup = mongoose.model('AgeGroup', ageGroupSchema, 'price_groups');

module.exports = AgeGroup;
