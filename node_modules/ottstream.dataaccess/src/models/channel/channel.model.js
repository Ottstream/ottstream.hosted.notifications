const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const channelSchema = mongoose.Schema(
  {
    middlewareId: {
      // depending on payment state this variable is changed so we know invoice is payed
      type: Number,
      required: false,
    },
    group_id: {
      // depending on payment state this variable is changed so we know invoice is payed
      type: Number,
      required: false,
    },
    name: [translationSchema],
    icon_path: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: String,
      required: false,
    },
    enabled: {
      // needed to know to send invoice with right date (will be updated while unpausing)
      type: Number,
      required: false,
    },
    packets: [{ type: Number }],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
channelSchema.plugin(toJSON);
channelSchema.plugin(paginate);
channelSchema.plugin(aggregatePaginate);

/**
 * @typedef channelSchema
 */
const Channel = mongoose.model('Channel', channelSchema, 'channels');

Channel.collection.dropIndex('number_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});
module.exports = Channel;
