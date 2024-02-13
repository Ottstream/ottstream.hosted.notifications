const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const packagePriceSchema = require('./package_price.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const _packageOption = mongoose.Schema(
  {
    sampleOption: {
      type: Number,
      required: false,
    },
    state: {
      type: Number,
      default: 1,
      enum: [0, 1, 2],
    },
    prices: [packagePriceSchema],
    package: { type: Schema.Types.ObjectId, ref: 'Package' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

_packageOption.index({ provider: 1 });
_packageOption.index({ package: 1 });
_packageOption.index({ provider: 1, package: 1 });

// add plugin that converts mongoose to json
_packageOption.plugin(toJSON);
_packageOption.plugin(paginate);
_packageOption.plugin(aggregatePaginate);

/**
 * @typedef package
 */
const packageOptionSchema = mongoose.model('PackageOption', _packageOption, 'package_options');

packageOptionSchema.collection.dropIndex('number_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
module.exports = packageOptionSchema;
