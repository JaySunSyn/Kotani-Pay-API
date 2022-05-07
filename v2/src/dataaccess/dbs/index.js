const {
  createAuth
} = require('./firebase/index');

// = require('./memory/index') // switch out db as required
// = require('./mongod/index')

const accDb = {
  createAuth
};

module.exports = accDb;
