const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const sms = mongoose.Schema(
  {
    deliveryState: { type: Schema.Types.Number, required: true },
    deliveryMessage: { type: Schema.Types.String },
    deliveryDate: { type: Schema.Types.Date },
    deliverySystem: { type: Schema.Types.String, required: true },
    messageSource: { type: Schema.Types.String },
    messageId: { type: Schema.Types.String },
    message: { type: Schema.Types.String, required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
sms.plugin(toJSON);
sms.plugin(paginate);
sms.plugin(aggregatePaginate);

/**
 * @typedef sms
 */
const smsSchema = mongoose.model('sms', sms, 'smss');

smsSchema.collection.dropIndex('messageId_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});

module.exports = smsSchema;
