const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');
const discountGeneralInfo = require('./discount_general_info.model');
const discountNotificationSchema = require('./discount_notification.model');

const { Schema } = mongoose;

const discount = mongoose.Schema(
  {
    generalInfo: discountGeneralInfo,
    notifications: discountNotificationSchema,
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    priceGroups: [
      {
        item: { type: Schema.Types.ObjectId, ref: 'PriceGroup' },
      },
    ],
    packages: [{ type: Schema.Types.ObjectId, ref: 'Package' }],
    equipments: [{ type: Schema.Types.ObjectId, ref: 'Equipment' }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: Number,
      required: false,
      default: 1, // 0 is hide from client list
    },
    forDefaultPriceGroup: {
      type: Boolean,
      required: true,
      default: false, // 0 is hide from client list
    },
    timelineStatus: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a virtual property `domain` that's computed from `email`.
// discount.virtual('timelineStatus').get(function () {
//   let timeLineStatus = 0;
//   if (this.generalInfo?.startDate <= new Date() <= this.generalInfo?.endDate) timeLineStatus = 1;
//   if (this.generalInfo?.startDate >= new Date()) timeLineStatus = 2;
//   if (this.generalInfo?.endDate < new Date()) timeLineStatus = 0;
//   return timeLineStatus;
// });

// add plugin that converts mongoose to json
discount.plugin(toJSON);
discount.plugin(paginate);
discount.plugin(aggregatePaginate);

/**
 * @typedef discount
 */
const discountSchema = mongoose.model('Discount', discount, 'discounts');

module.exports = discountSchema;
