const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const bookingSchema = mongoose.Schema(
  {
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    package: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ChannelPackage',
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

/**
 * @typedef bookingSchema
 */
// const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

// module.exports = Booking;
