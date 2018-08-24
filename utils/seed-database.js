'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Check = require('../models/check');
const Table = require('../models/table');
const Item = require('../models/item');
const User = require('../models/user');

const seedChecks = require('../db/seed/checks');
const seedTables = require('../db/seed/tables');
const seedItems = require('../db/seed/items');
const seedUsers = require('../db/seed/users');

mongoose.connect(DATABASE_URL, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all(seedUsers.map( user => User.hashPassword(user.password)));
  })
  .then( digests => {
    seedUsers.forEach((user, i) => user.password = digests[i]);

    return Promise.all([
      Check.insertMany(seedChecks),

      Table.insertMany(seedTables),

      Item.insertMany(seedItems),

      User.insertMany(seedUsers),
      User.createIndexes(),
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
