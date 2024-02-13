const mongoose = require('mongoose');
const { toJSON } = require('../plugins');
const clientSettingsTableSchema = require('./client_settings_table.model');
const clientSettingsExtendedTableSchema = require('./client_settings_extended_table.model');

const clientSettingsSchema = mongoose.Schema(
  {
    extendedType: {
      type: Number,
      required: false,
      default: 0, // 0 - off, 1 - on
    },
    table: clientSettingsTableSchema,
    extendedTable: clientSettingsExtendedTableSchema,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientSettingsSchema.plugin(toJSON);

module.exports = clientSettingsSchema;
