const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const autoIncrement = require('mongoose-auto-increment');
const { toJSON, paginate } = require('../plugins');
const calendarEventCommendSchema = require('./calendar_event_comment');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;

const calendarEvent = mongoose.Schema(
  {
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    location: { type: Schema.Types.ObjectId, ref: 'ClientLocation' },
    equipmentInstaller: { type: Schema.Types.ObjectId, ref: 'User' },
    lat: { type: Schema.Types.Number },
    comments: [calendarEventCommendSchema],
    long: { type: Schema.Types.Number },
    title: { type: Schema.Types.String },
    startDate: { type: Date },
    allDay: { type: Boolean },
    endDate: { type: Date },
    paymentType: { type: String },
    paymentPrice: { type: Number },
    customerAddress: { type: Object },
    officeAddress: { type: Object },
    description: { type: Schema.Types.String },
    state: { type: Schema.Types.String },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
calendarEvent.plugin(toJSON);
calendarEvent.plugin(paginate);
calendarEvent.plugin(aggregatePaginate);

/**
 * @typedef calendarEvent
 */
const calendarEventSchema = mongoose.model('CalendarEvent', calendarEvent, 'calendar_events');

module.exports = calendarEventSchema;
