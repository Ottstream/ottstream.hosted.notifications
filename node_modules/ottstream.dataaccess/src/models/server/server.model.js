const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const serverSchema = mongoose.Schema(
  {
    middlewareId: {
      // depending on payment state this variable is changed so we know invoice is payed
      type: Number,
      required: false,
    },
    name: [translationSchema],
    ip: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: String,
      required: false,
    },
    spdtest_url: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: String,
      required: false,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
serverSchema.plugin(toJSON);
serverSchema.plugin(paginate);

/**
 * @typedef serverSchema
 */
const Server = mongoose.model('Server', serverSchema, 'servers');

module.exports = Server;
