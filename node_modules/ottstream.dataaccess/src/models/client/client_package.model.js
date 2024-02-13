const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { toJSON, paginate } = require('../plugins');
// const clientPackageItemSchema = require('./client_package_item.model');

const { Schema } = mongoose;

const clientPackageSchema = mongoose.Schema(
  {
    // isChecked: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
    isDefault: {
      type: Boolean,
      required: false,
      default: false,
    },
    packageName: {
      type: String,
      required: false,
      default: 'PackageName',
    },
    packageType: {
      type: String,
      required: false,
      default: 'Base',
    },
    expireDate: {
      type: Date,
      required: false,
      default: Date.now,
      validate(value) {
        if (value) {
          value.setDate(value.getDate() + 1);
        }
      },
    },
    expireNew: {
      type: String,
      required: false,
      default: '',
    },
    recurringPayment: {
      type: Boolean,
      required: false,
      default: false,
    },
    currentPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    state: {
      type: Number, // 1 = working, 0 = stoped
      required: true,
      default: 1,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    // locations: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'ClientLocation',
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientPackageSchema.plugin(toJSON);
clientPackageSchema.plugin(paginate);
clientPackageSchema.plugin(aggregatePaginate);

/**
 * @typedef clientPackageSchema
 */
const ClientPackage = mongoose.model('ClientPackage', clientPackageSchema, 'client_package');

module.exports = ClientPackage;
