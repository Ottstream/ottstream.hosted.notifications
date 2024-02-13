const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const geoipSchema = mongoose.Schema(
  {
    ip: {
      // depending on payment state this variable is changed so we know invoice is payed
      type: String,
      required: true,
    },
    geoIpInfo: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
geoipSchema.plugin(toJSON);
geoipSchema.plugin(paginate);

/**
 * @typedef geoipSchema
 */
const Geoip = mongoose.model('Geoip', geoipSchema, 'geoips');

module.exports = Geoip;
