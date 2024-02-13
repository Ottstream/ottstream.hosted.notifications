const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const clientUsedDeviceActivitySchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: false,
    },
    model: {
      type: String,
      required: false,
    },
    lastActiveTime: {
      type: Date,
      required: false,
      default: Date.now,
    },
    modelCode: {
      type: String,
      required: false,
    },
    providerName: {
      type: String,
      required: false,
    },
    manufacturer: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    geoIpInfo: {
      type: Object,
      required: false,
    },
    macAddress: {
      type: String,
      required: false,
    },
    serialN: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    timeShift: {
      type: Number,
      required: false,
      min: 0,
      max: 12,
    },
    language: {
      type: String,
      required: false,
    },
    remoteControl: {
      type: String,
      required: false,
    },
    audioTrackDefault: {
      type: String,
      required: false,
    },
    httpCaching: {
      type: Number,
      required: false,
    },
    streamQuality: {
      type: String,
      required: false,
    },
    isSD: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHD: {
      type: Boolean,
      required: false,
      default: false,
    },
    isFHD: {
      type: Boolean,
      required: false,
      default: false,
    },
    isUHD: {
      type: Boolean,
      required: false,
      default: false,
    },
    isBackgroundPlayer: {
      type: Boolean,
      required: false,
      default: true,
    },
    uiFontSize: {
      type: String,
      required: false,
    },
    lastUpdate: {
      type: Number,
      required: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'ClientLocation',
      index: true,
    },
    // locations: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'ClientLocation',
    // },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientUsedDeviceActivitySchema.plugin(toJSON);
clientUsedDeviceActivitySchema.plugin(paginate);

/**
 * @typedef clientUsedDeviceActivitySchema
 */
const ClientUsedDeviceActivity = mongoose.model(
  'ClientUsedDeviceActivity',
  clientUsedDeviceActivitySchema,
  'client_used_device'
);

module.exports = ClientUsedDeviceActivity;
