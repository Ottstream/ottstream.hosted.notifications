const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const calendarEventCommendSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    isCancel: {
      type: Boolean,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
calendarEventCommendSchema.plugin(toJSON);

module.exports = calendarEventCommendSchema;
