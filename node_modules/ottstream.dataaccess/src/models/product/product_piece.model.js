const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const productPiece = mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productPiece.plugin(toJSON);
productPiece.plugin(paginate);

/**
 * @typedef productPieceSchema
 */

module.exports = productPiece;
