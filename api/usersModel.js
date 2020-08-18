const db = require('../data/knexDb');

module.exports = {
  add,
  find,
  findBy
};

function add(user) {
  return db('users')
    .insert(user)
    .then(id => findBy({ id }))
    .catch(err => console.log(err));
};

function find() {
  return db('users')
    .then(users => users)
    .catch(err => {
      console.log(err);
      return null;
    });
};

function findBy(column) {
  return db('users')
    .where(column)
    .first()
    .then(user => user)
    .catch(err => {
      console.log(err);
      return null;
    });
};