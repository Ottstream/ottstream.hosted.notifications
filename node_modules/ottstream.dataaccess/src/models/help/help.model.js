const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const help = mongoose.Schema(
  {
    video: {
      type: String,
      required: false,
    },
    videoDescription: {
      type: String,
      required: false,
    },
    categoryName: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    number: {
      type: Number,
      required: false,
    },
    parent: { type: Schema.Types.ObjectId, ref: 'Help' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
help.plugin(toJSON);
help.plugin(paginate);
help.plugin(aggregatePaginate);
/**
 * @typedef help
 */
const helpSchema = mongoose.model('Help', help, 'helps');
helpSchema.collection.dropIndex('number_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});

module.exports = helpSchema;
