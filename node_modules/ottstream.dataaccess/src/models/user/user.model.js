const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const logger = require('../../utils/logger/logger');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const userSchema = mongoose.Schema(
  {
    userSettings: {
      type: Object,
      required: true,
      default: {},
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: false,
    },
    accessEnable: {
      type: Boolean,
      required: false,
      default: true,
    },
    accessAnEnable: {
      type: Boolean,
      required: false,
      default: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'OttProviderAddress',
    },
    showUnsuccessfulTransactions: {
      type: Boolean,
      required: false,
      default: true,
    },
    confirmPassword: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      private: true, // used by the toJSON plugin
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
    },
    firstname: {
      type: String,
      required: false,
      trim: true,
    },
    color: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    phone: {
      phoneNumber: { type: String, unique: false, required: false },
      countryCode: { type: String },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/)) {
          throw new Error('Password must contain at least one letter, one number and one symbol');
        }
      },
      private: true, // used by the toJSON plugin
    },
    lang: {
      type: String,
      default: 'en',
    },
    number: {
      type: Number,
      required: false,
    },
    darkMode: {
      type: Boolean,
      default: 0,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
    },
    timezone: {
      type: String,
      required: false,
    },
    state: {
      type: Number,
      required: true,
      default: 0,
    },
    loginAttempt: {
      type: Number,
      required: true,
      default: 0,
    },
    geoInfo: {
      type: Object,
      required: false,
    },
    settings: {
      type: Object,
      required: true,
      default: {},
    },

    rolesInfo: {
      cashier: {
        type: Boolean,
        required: false,
        default: false,
      },
      advancedCashier: {
        type: Boolean,
        required: false,
        default: false,
      },
      support: {
        type: Boolean,
        required: false,
        default: false,
      },
      admin: {
        type: Boolean,
        required: false,
        default: true,
      },
      equipmentInstaller: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    lastActiveTime: {
      type: Date,
      required: false,
      default: Date.now,
    },
    createTime: {
      type: Date,
      required: false,
      default: Date.now,
    },
    migrated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: false,
    },
    // eslint-disable-next-line no-dupe-keys
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    status: {
      type: Number,
      required: false,
      default: 1, // 0 is hide from client list
    },
    loginStatus: {
      type: Number,
      required: false,
      enum: [0, 1, 2], // logout, active now, unsuccessful
    },
    telegramLogin: {
      type: String,
      required: false,
    },
    telegramPassword: {
      type: String,
      required: false,
    },
    logoutTime: {
      type: Date,
      required: false,
    },
    // isSelectedRole: {
    //   type: Boolean,
    //   required: false,
    //   default: false, // true is selected role
    // },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.plugin(aggregatePaginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if phone is taken
 * @param {string} phone - The user's phone
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ 'phone.phoneNumber': phone, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Increment login attempt
 * * @param {string} password
 */
userSchema.methods.incrementLoginAttempt = async function (password) {
  const user = this;
  const isMatch = await user.isPasswordMatch(password);
  logger.info(`Login Attempt password match ${isMatch}`);
  if (!isMatch) {
    user.loginAttempt += 1;
    await user.save();
  }
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
