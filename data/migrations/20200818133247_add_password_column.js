exports.up = function (knex) {
  return knex.schema
    .table('users', tbl => {
      tbl.string('password')
        .notNullable()
        .defaultTo('');
    });
};

exports.down = function (knex) {
  return knex.schema.table('users').dropColumn('password');
};