const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const userActivitySchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    data: {
      type: Object,
      required: false,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userActivitySchema.plugin(toJSON);
userActivitySchema.plugin(paginate);
userActivitySchema.plugin(aggregatePaginate);

/**
 * @typedef UserActivity
 */
const UserActivity = mongoose.model('UserActivity', userActivitySchema, 'user_activities');

module.exports = UserActivity;
