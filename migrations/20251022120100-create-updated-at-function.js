'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION public.trg_set_updated_at() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END
      $$;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS public.trg_set_updated_at();`);
  },
};
