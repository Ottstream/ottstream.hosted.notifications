const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const clientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    from: {
      type: Number,
      required: true,
    },
    to: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
clientSchema.plugin(toJSON);
clientSchema.plugin(paginate);

/**
 * @typedef clientAgeGroupSchema
 */
const ClientAgeGroup = mongoose.model('ClientAgeGroup', clientSchema, 'client_age_groups');

module.exports = ClientAgeGroup;
