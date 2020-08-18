
exports.up = function (knex) {
  return knex.schema
    .createTable('users', tbl => {
      tbl.increments('id');
      tbl.string('username')
        .notNullable()
        .unique();
      tbl.string('department')
        .notNullable()
        .defaultTo('customer_support');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
