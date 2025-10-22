'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { BIGINT, DATE, TEXT, BOOLEAN, INTEGER, DECIMAL } = Sequelize;

    await queryInterface.createTable('pallets', {
      id: { type: BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      qr_code: { type: TEXT },
      completed: { type: BOOLEAN },
      num_doca: { type: INTEGER },
      seq_pallet: { type: DECIMAL, allowNull: false },
      station: { type: INTEGER },
    });

    await queryInterface.addConstraint('pallets', {
      fields: ['seq_pallet'],
      type: 'unique',
      name: 'pallets_seq_pallet_key',
    });

    await queryInterface.createTable('pack', {
      id: { type: BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      qr_code: { type: TEXT },
      orig: { type: INTEGER },
      seq_pallet: { type: DECIMAL },
      seq_pack: { type: DECIMAL },
      lastpack: { type: BOOLEAN },
      pospallet: { type: INTEGER },
      robot_num: { type: INTEGER },
    });

    await queryInterface.addConstraint('pack', {
      fields: ['seq_pack'],
      type: 'unique',
      name: 'pack_seq_pack_uk',
    });

    await queryInterface.addConstraint('pack', {
      fields: ['seq_pallet'],
      type: 'foreign key',
      name: 'fk_pack_pallet_seq',
      references: { table: 'pallets', field: 'seq_pallet' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('pack', 'fk_pack_pallet_seq').catch(() => {});
    await queryInterface.removeConstraint('pack', 'pack_seq_pack_uk').catch(() => {});
    await queryInterface.dropTable('pack');
    await queryInterface.removeConstraint('pallets', 'pallets_seq_pallet_key').catch(() => {});
    await queryInterface.dropTable('pallets');
  },
};
