'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tableSchema = Schema({
  number: { type: Number, required: true, unique: true }
});

tableSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Table', tableSchema);
