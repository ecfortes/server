'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pack
          DROP CONSTRAINT IF EXISTS fk_pack_pallet_seq,
          DROP CONSTRAINT IF EXISTS fk_pack_seq_pallet_pallets;
        `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pack
          ADD CONSTRAINT fk_pack_pallet_seq
          FOREIGN KEY (seq_pallet)
          REFERENCES public.pallets (seq_pallet)
          ON UPDATE CASCADE
          ON DELETE RESTRICT;
        `,
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pack
          DROP CONSTRAINT IF EXISTS fk_pack_pallet_seq;
        `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pack
          ADD CONSTRAINT fk_pack_pallet_seq
          FOREIGN KEY (seq_pallet)
          REFERENCES public.pallets (seq_pallet)
          ON UPDATE CASCADE
          ON DELETE CASCADE;
        `,
        { transaction }
      );
    });
  },
};
