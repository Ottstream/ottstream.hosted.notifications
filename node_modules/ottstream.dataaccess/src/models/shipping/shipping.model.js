const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const shipping = mongoose.Schema(
  {
    returnLabel: { type: Schema.Types.Boolean },
    shipFrom: {},
    boxes: [],
    equipments: [],
    shipping_documents: [],
    trackings: [],
    shipTo: {},
    selectedCourier: {},
    insurance: {},
    label: {},
    easyShipData: {},
    totalShipping: { type: Schema.Types.Number },
    isPremiumShipping: { type: Schema.Types.Boolean },
    isStandartPickup: { type: Schema.Types.Boolean },
    selected_courier: { type: Schema.Types.String },
    delivery_state: { type: Schema.Types.String },
    shipment_state: { type: Schema.Types.String },
    pickup_state: { type: Schema.Types.String },
    label_state: { type: Schema.Types.String },
    easyship_updated_at: { type: Schema.Types.Date },
    tracking_page_url: { type: Schema.Types.String },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    easyship_shipment_id: { type: Schema.Types.String },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
shipping.plugin(toJSON);
shipping.plugin(paginate);
shipping.plugin(aggregatePaginate);
/**
 * @typedef shipping
 */
const shippingSchema = mongoose.model('Shipping', shipping, 'shippings');

shippingSchema.collection.dropIndex('number_1', function (err) {
  if (err) {
    // eslint-disable-next-line no-console
    // console.log('Error in dropping index!', err);
  }
});

module.exports = shippingSchema;
