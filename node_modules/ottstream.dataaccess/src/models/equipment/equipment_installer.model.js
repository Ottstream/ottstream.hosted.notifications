const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const equipmentInstaller = mongoose.Schema(
  {
    name: [translationSchema],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
equipmentInstaller.plugin(toJSON);
equipmentInstaller.plugin(paginate);
equipmentInstaller.plugin(aggregatePaginate);

/**
 * @typedef equipmentInstaller
 */
const equipmentInstallerSchema = mongoose.model('EquipmentInstaller', equipmentInstaller, 'equipment_installers');

module.exports = equipmentInstallerSchema;
