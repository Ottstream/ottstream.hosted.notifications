const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const ClientUsedDevice = require('./client_used_device.model').schema;

const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const clientLocationSchema = mongoose.Schema(
  {
    locationName: {
      type: String,
      required: false,
      trim: false,
      default: 'Default',
    },
    roomsCount: {
      type: Number,
      required: false,
      default: 1,
    },
    roomsCountNew: {
      type: Number,
      required: false,
      default: 1,
    },
    priceGroup: {
      type: String,
      required: true,
      default: 'Price Group Example01',
    },
    keywords: {
      type: Object,
    },
    discount: {
      type: String,
      required: false,
    },
    //     discount: {
    //       type: Schema.Types.ObjectId,
    //       ref: 'Discount',
    //     },
    settingsUpdateUts: {
      type: Number,
      required: false,
    },
    subscriptionActivationDate: {
      type: Date,
      required: false,
    },
    subscriptionCancelDate: {
      type: Date,
      required: false,
    },
    subscriptionPendingDate: {
      type: Date,
      required: false,
    },
    login: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    syncState: {
      type: Number,
      required: true,
      default: 2,
    },
    syncMessage: {
      type: String,
    },
    comment: {
      type: String,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      private: false,
    },
    lastChangedPassword: {
      type: Date,
      required: false,
    },
    timezone: {
      type: String,
      required: false,
      // default: new Date(), for future
    },
    // server: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Server',
    // },
    server: {
      type: Schema.Types.ObjectId,
      ref: 'Server',
      index: true,
    },
    maxDevice: {
      type: Number,
      required: false,
      default: 5,
    },
    parentalCode: {
      type: String,
      required: false,
      private: false,
    },
    isBlockLocation: {
      type: Boolean,
      required: true,
      default: false,
    },
    isPauseSubscriptions: {
      type: Boolean,
      required: false,
      default: false,
    },
    pauses: [],
    pauseStartDate: {
      type: Date,
    },
    VODEnable: {
      type: Boolean,
      required: false,
      default: true,
    },
    archiveEnable: {
      type: Boolean,
      required: false,
      default: true,
    },
    autostartStatus: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
      required: false,
    },
    recurringPayment: {
      type: Boolean,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    packetStart: {
      type: Number,
      required: false,
    },
    packetExpire: {
      type: Number,
      required: false,
    },
    timeShiftEnable: {
      type: Boolean,
      required: false,
      default: true,
    },
    lastActiveTime: {
      type: Date,
      required: false,
      default: Date.now,
    },
    geoInfo: {
      type: Object,
      required: false,
      default: {},
    },
    subscriptionState: {
      type: Number,
      required: true,
      default: 0,
    },
    subscriptionExpireDate: {
      type: Date,
      required: false,
    },
    isRecurring: {
      type: Boolean,
      required: false,
    },
    subscriptionPauses: {
      type: Object,
      required: false,
    },
    migrated: {
      type: Boolean,
      required: false,
      default: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    middlewareId: {
      type: String,
      required: false,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
    commentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        index: true,
      },
    ],
    usedDevices: [ClientUsedDevice],
    // profiles: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'ClientProfile',
    //   },
    // ],
    // packagesInfo: {
    //   name: {
    //     type: String,
    //     required: false,
    //   },
    //   dayMonth: {
    //     type: Number,
    //     required: false,
    //   },
    //   globalAction: {
    //     type: Number,
    //     required: false,
    //     default: 0,
    //   },
    //   subscribeToDate: {
    //     type: Date,
    //     required: false,
    //   },
    //   subscribeDayMonthType: {
    //     type: String,
    //     required: false,
    //   },
    //   stop: {
    //     type: String,
    //     required: false,
    //   },
    //   subscribeToEndOfMaxExpire: {
    //     type: String,
    //     required: false,
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientLocationSchema.plugin(toJSON);
clientLocationSchema.plugin(paginate);
clientLocationSchema.plugin(aggregatePaginate);

clientLocationSchema.index({ clientId: 1, provider: 1 });

clientLocationSchema.pre('save', async function (next) {
  // const user = this;
  // if (user.isModified('password')) {
  //   user.password = await bcrypt.hash(user.password, 8);
  // }
  next();
});

// clientLocationSchema.pre('save', async function (next) {
//   const user = this;
//   if (user.isModified('parentalCode')) {
//     user.parentalCode = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });
/**
 * @typedef clientLocationSchema
 */
const ClientLocation = mongoose.model('ClientLocation', clientLocationSchema, 'client_locations');
module.exports = ClientLocation;
