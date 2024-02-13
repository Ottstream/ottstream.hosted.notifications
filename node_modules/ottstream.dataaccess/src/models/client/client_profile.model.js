const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const clientProfileSchema = mongoose.Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    locations: {
      type: Schema.Types.ObjectId,
      ref: 'ClientLocation',
    },
    photo: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: false,
    },
    nickname: {
      type: String,
      required: false,
      trim: false,
    },
    protectCode: {
      type: Number,
      required: false,
      min: 0,
      max: 6,
    },
    timeshift: {
      type: Number,
      required: false,
      min: 0,
      max: 12,
    },
    inactivityTimeout: {
      type: Number,
      required: false,
    },
    language: {
      type: String,
      required: false,
    },
    audiotrackDefault: {
      type: String,
      required: false,
    },
    channelsOrderMode: {
      type: String,
      required: false,
    },
    ageGroup: {
      type: Schema.Types.ObjectId,
      ref: 'ClientAgeGroup',
    },
    enableProfile: {
      type: Boolean,
      required: false,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    protectBoot: {
      type: Boolean,
      required: false,
      default: false,
    },
    protectSetting: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideMediaByAge: {
      type: Boolean,
      required: false,
      default: false,
    },
    protectMediaByAge: {
      type: Boolean,
      required: false,
      default: false,
    },
    vodEnable: {
      type: Boolean,
      required: false,
      default: false,
    },
    blood: {
      hide: { type: Boolean, default: false },
      protect: { type: Boolean, default: false },
    },
    violence: {
      hide: { type: Boolean, default: false },
      protect: { type: Boolean, default: false },
    },
    obscene: {
      hide: { type: Boolean, default: false },
      protect: { type: Boolean, default: false },
    },
    porn: {
      hide: { type: Boolean, default: false },
      protect: { type: Boolean, default: false },
    },
    horror: {
      hide: { type: Boolean, default: false },
      protect: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientProfileSchema.plugin(toJSON);
clientProfileSchema.plugin(paginate);

/**
 * @typedef clientProfileSchema
 */
// const ClientProfile = mongoose.model('ClientProfile', clientProfileSchema, 'client_profile');
// module.exports = ClientProfile;
