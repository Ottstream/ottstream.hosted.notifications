const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const notification = mongoose.Schema(
  {
    isViewed: {
      type: Boolean,
      required: false,
      default: false,
    },
    note: {
      type: String,
    },
    type: {
      type: Number,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    providers: [{ type: Schema.Types.ObjectId, ref: 'OttProvider' }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    updateUser: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notification.plugin(toJSON);
notification.plugin(paginate);
notification.plugin(aggregatePaginate);
notification.plugin(autoIncrement.plugin, {
  model: 'notificationSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef notification
 */
const notificationSchema = mongoose.model('Notification', notification, 'notifications');

module.exports = notificationSchema;
