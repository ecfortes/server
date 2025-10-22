'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
      COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP EXTENSION IF EXISTS pg_trgm;`);
  },
};
