const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const equipmentType = mongoose.Schema(
  {
    name: [translationSchema],
    description: {
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
equipmentType.plugin(toJSON);
equipmentType.plugin(paginate);
equipmentType.plugin(aggregatePaginate);
equipmentType.plugin(autoIncrement.plugin, {
  model: 'equipmentTypeSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef equipmentType
 */
const equipmentTypeSchema = mongoose.model('EquipmentType', equipmentType, 'equipment_types');

module.exports = equipmentTypeSchema;
