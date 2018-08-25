'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Check = require('../models/check');
const Table = require('../models/table');

function validateTableId(tableId) {
  if (tableId === undefined) {
    return Promise.resolve();
  }
  if (!mongoose.Types.ObjectId.isValid(tableId)) {
    const err = new Error('The `tableId` is not valid');
    err.status = 400;
    return Promise.reject(err);
  }
  return Table.countDocuments({ _id: tableId })
    .then(count => {
      if (count === 0) {
        const err = new Error('The `tableId` is not valid');
        err.status = 400;
        return Promise.reject(err);
      }
    });
}

const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Check.find()
    .populate('tableId')
    .populate('orderedItems.itemId')
    .sort({ 'updatedAt': 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Check.findOne({ _id: id })
    .populate('orderedItems.itemId')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { tableId } = req.body;

  const newCheck = { tableId };

  /***** Never trust users - validate input *****/
  if (!tableId) {
    const err = new Error('Missing `tableId` in request body');
    err.status = 400;
    return next(err);
  }

  Promise.all([
    validateTableId(tableId)
  ])
    .then(() => Check.create(newCheck))
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err === 'InvalidTable') {
        err = new Error('Check table already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id/addItem', (req, res, next) => {
  const { id } = req.params;
  const { itemId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const err = new Error('The `itemId` is not valid');
    err.status = 400;
    return next(err);
  }

  Check.findByIdAndUpdate( id,
    { $push: {
      'orderedItems': {
        'itemId': itemId
      }
    }},
    { new: true }
  )
    .populate('orderedItems.itemId')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
});

router.put('/:id/removeItem', (req, res, next) => {
  const { id } = req.params;
  const { orderedItemId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(orderedItemId)) {
    const err = new Error('The `orderedItemId` is not valid');
    err.status = 400;
    return next(err);
  }

  Check.findByIdAndUpdate( id,
    { $pull: {
      'orderedItems': {
        '_id': orderedItemId
      }
    }},
    { new: true }
  )
    .populate('orderedItems.itemId')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
});

router.put('/:id/close', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Check.findByIdAndUpdate( id,
    { closed: true}, { new: true } )
    .populate('orderedItems.itemId')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
