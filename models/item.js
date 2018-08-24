'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true }
});

itemSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Item', itemSchema);
