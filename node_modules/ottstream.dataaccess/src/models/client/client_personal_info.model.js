const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientPersonalInfoSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    sex: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    // isBlocked: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientPersonalInfoSchema.plugin(toJSON);

module.exports = clientPersonalInfoSchema;
