const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const chat = mongoose.Schema(
  {
    readDate: { type: Schema.Types.Date },
    message: { type: Schema.Types.String, required: true },
    messageSource: { type: Schema.Types.String },
    readState: { type: Schema.Types.Number, required: true },
    from_user: { type: Schema.Types.ObjectId, ref: 'User' },
    from_provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    from_client: { type: Schema.Types.ObjectId, ref: 'Client' },
    to_user: { type: Schema.Types.ObjectId, ref: 'User' },
    to_provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    to_client: { type: Schema.Types.ObjectId, ref: 'Client' },
    deliveryState: { type: Schema.Types.Number, required: true },
    deliveryMessage: { type: Schema.Types.String },
    deliveryDate: { type: Schema.Types.Date },
    deliverySystem: { type: Schema.Types.String, required: true },
    sms: { type: Schema.Types.ObjectId, ref: 'Sms' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    byUser: { type: Schema.Types.ObjectId, ref: 'User' },
    readUser: { type: Schema.Types.ObjectId, ref: 'User' },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chat.plugin(toJSON);
chat.plugin(paginate);
chat.plugin(aggregatePaginate);

/**
 * @typedef chat
 */
const chatSchema = mongoose.model('chat', chat, 'chats');

module.exports = chatSchema;
