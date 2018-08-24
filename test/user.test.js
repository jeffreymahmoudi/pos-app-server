'use strict';

require('dotenv').config();

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
// const {dbConnect, dbDisconnect} = require('../db-knex');

const User = require('../models/user');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

before(function() {
  return dbConnect(TEST_DATABASE_URL);
});

after(function() {
  return dbDisconnect();
});

describe('Express Backend API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstname = 'exampleFirst';
  const lastname = 'exampleLast';

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password, firstname, lastname })
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname', 'createdAt', 'updatedAt');
            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(username);
            expect(res.body.firstname).to.equal(firstname);
            expect(res.body.lastname).to.equal(lastname);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.firstname).to.equal(firstname);
            expect(user.lastname).to.equal(lastname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ password, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'username\' in request body');
          });
      });
      it('Should reject users with missing password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'password\' in request body');
          });

      });
      it('Should reject users with non-string username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username: 1234, password, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' must be type String');
          });
      });
      it('Should reject users with non-string password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: 1234, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be type String');
          });
      });
      it('Should reject users with non-trimmed username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username: ` ${username} `, password, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' cannot start or end with whitespace');
          });
      });
      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: ` ${password}`, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' cannot start or end with whitespace');
          });
      });
      it('Should reject users with empty username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username: '', password, firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' must be at least 1 characters long');
          });
      });
      it('Should reject users with password less than 8 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: 'asdfghj', firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password: new Array(73).fill('a').join(''), firstname, lastname })

          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
          });
      });
      it('Should reject users with duplicate username', function () {
        return User
          .create({
            username,
            password,
            firstname,
            lastname
          })
          .then(() => {
            return chai
              .request(app)
              .post('/api/users')
              .send({ username, password, firstname, lastname });
          })
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('The username already exists');
          });
      });
      it('Should trim firstname', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password, firstname: ` ${firstname} `, lastname })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname', 'createdAt', 'updatedAt');
            expect(res.body.firstname).to.equal(firstname);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstname).to.equal(firstname);
          });
      });
      it('Should trim lastname', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password, firstname, lastname: ` ${lastname} ` })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname', 'createdAt', 'updatedAt');
            expect(res.body.lastname).to.equal(lastname);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.lastname).to.equal(lastname);
          });
      });
    });
  });
});
