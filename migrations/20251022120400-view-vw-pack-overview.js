'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public.vw_pack_overview AS
      SELECT
        (p.created_at)::date AS fecha,
        (p.created_at)::time(0) without time zone AS hora,
        p.qr_code AS idea_ean,
        p.orig AS origem_enfardadeira,
        CASE
          WHEN length(p.qr_code) >= 10 THEN substr(p.qr_code, 3, 6)
          ELSE NULL
        END AS ot,
        p.robot_num AS iden_robot,
        pl.qr_code AS iden_pallet,
        p.lastpack AS palet_completo,
        pl.num_doca AS destino_muelle
      FROM public.pack p
      LEFT JOIN public.pallets pl ON (pl.seq_pallet = p.seq_pallet);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS public.vw_pack_overview;`);
  },
};
