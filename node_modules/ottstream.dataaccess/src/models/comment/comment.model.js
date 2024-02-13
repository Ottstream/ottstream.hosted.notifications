const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const comment = mongoose.Schema(
  {
    comment: {
      type: String,
      required: false,
    },
    isPrivate: {
      type: Boolean,
      required: false,
      default: false,
    },
    migrated: {
      type: Boolean,
      required: false,
    },
    notified: {
      type: Boolean,
      required: false,
      default: false,
    },
    sendNotification: {
      type: Boolean,
      required: false,
      default: true,
    },
    reminderDate: {
      type: Date,
    },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    notification: { type: Schema.Types.ObjectId, ref: 'Notification' },
    updateUser: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
comment.plugin(toJSON);
comment.plugin(paginate);
comment.plugin(aggregatePaginate);
comment.plugin(autoIncrement.plugin, {
  model: 'commentSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef comment
 */
const commentSchema = mongoose.model('Comment', comment, 'comments');

module.exports = commentSchema;
