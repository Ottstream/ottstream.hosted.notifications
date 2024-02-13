const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

autoIncrement.initialize(mongoose.connection);
const { Schema } = mongoose;

const channelCategorySchema = mongoose.Schema(
  {
    name: [translationSchema],
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    icon: {
      type: Schema.Types.Mixed,
      required: false,
    },
    number: {
      type: Number,
      required: true,
      default: 1,
    },
    order: {
      type: String,
      required: false,
    },
    color: {
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

channelCategorySchema.pre('save', function (next) {
  if (!this.order) this.order = this.get('_id'); // considering _id is input by client
  next();
});

// add plugin that converts mongoose to json
channelCategorySchema.plugin(toJSON);
channelCategorySchema.plugin(paginate);
channelCategorySchema.plugin(autoIncrement.plugin, {
  model: 'ChannelCategory',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
// channelCategorySchema.plugin(autoIncrement, { model: 'ChannelCategory', field: '_id', startAt: 1 });

/**
 * @typedef channelCategorySchema
 */
// const ChannelCategorySchema = mongoose.model('ChannelCategory', channelCategorySchema, 'channel_categories');
// // ChannelCategorySchema.collection.dropIndexes(function (err, results) {
// //   // Handle errors
// // });
// /**
//  * @typedef channelSchema
//  */
//
// module.exports = ChannelCategorySchema;
