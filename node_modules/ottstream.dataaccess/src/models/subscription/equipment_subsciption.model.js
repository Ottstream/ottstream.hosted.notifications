const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

// eslint-disable-next-line no-unused-vars
const { Schema } = mongoose;

const equipmentSubscriptionSchema = mongoose.Schema(
  {
    price: {
      type: Number,
      required: false,
    },
    serialN: {
      type: String,
      required: false,
    },
    macAddress: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      required: false,
    },
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
equipmentSubscriptionSchema.plugin(toJSON);
equipmentSubscriptionSchema.plugin(paginate);

equipmentSubscriptionSchema.index({ serialN: 1 });
equipmentSubscriptionSchema.index({ client: 1 });
equipmentSubscriptionSchema.index({ invoice: 1 });
equipmentSubscriptionSchema.index({ equipment: 1 });
equipmentSubscriptionSchema.index({ provider: 1 });
equipmentSubscriptionSchema.index({ equipment: 1, client: 1 });

/**
 * @typedef equipmentSubscriptionSchema
 */
const EquipmentSubscription = mongoose.model(
  'EquipmentSubscription',
  equipmentSubscriptionSchema,
  'equipment_subscriptions'
);

module.exports = EquipmentSubscription;
