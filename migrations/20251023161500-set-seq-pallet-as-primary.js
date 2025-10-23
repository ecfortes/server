'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Drop FK first so we can alter the primary key
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pack
          DROP CONSTRAINT IF EXISTS fk_pack_pallet_seq,
          DROP CONSTRAINT IF EXISTS fk_pack_seq_pallet_pallets;
        `,
        { transaction }
      );

      // Drop existing PK and unique constraint on pallets
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pallets
          DROP CONSTRAINT IF EXISTS pallets_pkey,
          DROP CONSTRAINT IF EXISTS pallets_seq_pallet_key;
        `,
        { transaction }
      );

      // Promote seq_pallet to be the primary key
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pallets
          ADD CONSTRAINT pallets_pkey PRIMARY KEY (seq_pallet);
        `,
        { transaction }
      );

      // Recreate FK so pack.seq_pallet references the new primary key
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

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Drop FK referencing seq_pallet PK
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pack
          DROP CONSTRAINT IF EXISTS fk_pack_pallet_seq;
        `,
        { transaction }
      );

      // Drop primary key on seq_pallet
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pallets
          DROP CONSTRAINT IF EXISTS pallets_pkey;
        `,
        { transaction }
      );

      // Restore original constraints
      await queryInterface.sequelize.query(
        `
          ALTER TABLE public.pallets
          ADD CONSTRAINT pallets_pkey PRIMARY KEY (id),
          ADD CONSTRAINT pallets_seq_pallet_key UNIQUE (seq_pallet);
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

