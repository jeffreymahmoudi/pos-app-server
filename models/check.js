'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkSchema = new Schema({
  tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  closed: { type: Boolean, default: false },
  orderedItems: [
    {
      id: { type: Schema.Types.ObjectId },
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    }
  ]
}, { timestamps: true });

checkSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Check', checkSchema);
