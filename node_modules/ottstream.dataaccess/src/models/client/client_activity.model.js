const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const clientActivitySchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    action: {
      type: Object,
    },
    number: {
      type: Number,
      required: true,
      default: 1,
    },
    actionDescription: {
      type: String,
    },
    userDescription: {
      type: String,
    },
    typeDescription: {
      type: String,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider', index: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientActivitySchema.plugin(toJSON);
clientActivitySchema.plugin(paginate);
clientActivitySchema.plugin(aggregatePaginate);
clientActivitySchema.plugin(autoIncrement.plugin, {
  model: 'ClientActivity',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});

/**
 * @typedef ClientActivity
 */
const ClientActivity = mongoose.model('ClientActivity', clientActivitySchema, 'client_activities');

module.exports = ClientActivity;
