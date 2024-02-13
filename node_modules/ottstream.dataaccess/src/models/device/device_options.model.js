const mongoose = require('mongoose');
const { paginate, toJSON } = require('../plugins');

const { Schema } = mongoose;

const deviceOptionSchema = mongoose.Schema(
  {
    http_caching: [],
    bitrate: [],
    servers: [],
    audiotrack_default: [],
    definition_filter: [],
    lang: [],
    stream_quality: [],
    background_player: [],
    ui_font_size: [],
    box_models: [],
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
deviceOptionSchema.plugin(toJSON);
deviceOptionSchema.plugin(paginate);

/**
 * @typedef deviceOptionSchema
 */
const DeviceOption = mongoose.model('DeviceOption', deviceOptionSchema, 'device_options');

module.exports = DeviceOption;
