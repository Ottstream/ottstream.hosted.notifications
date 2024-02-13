const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const easyshipCourier = mongoose.Schema(
  {
    courier_id: { type: Schema.Types.String, required: true },
    logo_url: { type: Schema.Types.String },
    data: {},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
easyshipCourier.plugin(toJSON);
easyshipCourier.plugin(paginate);
easyshipCourier.plugin(aggregatePaginate);
easyshipCourier.plugin(autoIncrement.plugin, {
  model: 'easyshipCourierSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef easyshipCourier
 */
const easyshipCourierSchema = mongoose.model('EasyshipCourier', easyshipCourier, 'easyship_couriers');

module.exports = easyshipCourierSchema;
