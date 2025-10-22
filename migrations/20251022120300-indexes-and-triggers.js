'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('pack', ['created_at'], {
      name: 'idx_pack_created_at',
      using: 'BTREE',
      order: [['created_at', 'DESC']],
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_pack_qr_code_trgm
      ON public.pack USING GIN (qr_code public.gin_trgm_ops);
    `);

    await queryInterface.addIndex('pack', ['seq_pallet'], {
      name: 'idx_pack_seq_pallet',
      using: 'BTREE',
    });

    await queryInterface.addIndex('pack', ['seq_pallet', 'created_at'], {
      name: 'idx_pack_seq_pallet_created_at',
      using: 'BTREE',
      order: [['created_at', 'DESC']],
    });

    await queryInterface.addIndex('pallets', ['created_at'], {
      name: 'idx_pallets_created_at',
      using: 'BTREE',
      order: [['created_at', 'DESC']],
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_pallets_qr_code_trgm
      ON public.pallets USING GIN (qr_code public.gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER set_updated_at_pack
      BEFORE UPDATE ON public.pack
      FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER set_updated_at_pallets
      BEFORE UPDATE ON public.pallets
      FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS set_updated_at_pack ON public.pack;`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS set_updated_at_pallets ON public.pallets;`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_pallets_qr_code_trgm;`);
    await queryInterface.removeIndex('pallets', 'idx_pallets_created_at').catch(() => {});
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_pack_qr_code_trgm;`);
    await queryInterface.removeIndex('pack', 'idx_pack_seq_pallet_created_at').catch(() => {});
    await queryInterface.removeIndex('pack', 'idx_pack_seq_pallet').catch(() => {});
    await queryInterface.removeIndex('pack', 'idx_pack_created_at').catch(() => {});
  },
};
