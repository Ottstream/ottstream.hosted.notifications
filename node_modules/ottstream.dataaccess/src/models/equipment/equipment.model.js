const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const equipment = mongoose.Schema(
  {
    name: [translationSchema],
    description: {
      type: String,
      required: false,
    },
    state: {
      type: Number,
      default: 1,
    },
    md: {
      type: String,
    },
    prices: [
      {
        md: {
          type: String,
        },
        priceGroup: {
          type: String,
        },
        pieces: [],
        showPriceGroupSelect: {
          type: Boolean,
        },
      },
    ],
    sku: {
      type: String,
    },
    type: { type: Schema.Types.ObjectId, ref: 'EquipmentType' },
    enableForSale: {
      type: Boolean,
      required: false,
      default: false,
    },
    isService: {
      type: Boolean,
      required: false,
      default: false,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    information: {
      category: { type: Schema.Types.Number }, // mongoId
      manufacturer: { type: Schema.Types.String }, // String
      certification: { type: Schema.Types.String }, // String
      condition: { type: Schema.Types.String }, // String
      standart: { type: Schema.Types.String }, // String
      os: { type: Schema.Types.String }, // String
      unitSize: { type: Schema.Types.String }, // String (sm, in)
      height: { type: Schema.Types.Number }, // Number
      width: { type: Schema.Types.Number }, // Number
      length: { type: Schema.Types.Number }, // Number
      unitWeight: { type: Schema.Types.String }, // String (kg, lb)
      productWeight: { type: Schema.Types.Number }, // Number
    },
    options: {
      selectedColor: {}, // Object
      colorsList: [], // Array
    },
    productImage: {
      imagesList: [], // Array
      colorCode: { type: Schema.Types.String }, // String
      colorFromList: {}, // Object
    },
    discount: {
      selectedDiscounts: [], // Array
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
equipment.plugin(toJSON);
equipment.plugin(paginate);
equipment.plugin(aggregatePaginate);
equipment.plugin(autoIncrement.plugin, {
  model: 'equipmentSchema',
  field: 'number',
  startAt: 1,
  incrementBy: 1,
});
/**
 * @typedef equipment
 */
const equipmentSchema = mongoose.model('Equipment', equipment, 'equipments');

module.exports = equipmentSchema;
