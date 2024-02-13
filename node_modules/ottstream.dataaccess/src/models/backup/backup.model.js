const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const backupSchema = mongoose.Schema(
  {
    table: {
      type: String,
      required: true,
    },
    changes: [],
    state: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: Number,
      required: true,
      default: 1,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
backupSchema.plugin(toJSON);
backupSchema.plugin(paginate);
backupSchema.plugin(aggregatePaginate);

/**
 * @typedef backupSchema
 */
const Backup = mongoose.model('Backup', backupSchema, 'backups');

module.exports = Backup;
