const express = require('express');
const router = express.Router();
const {
  getProfissionais,
  getProfissional,
  createProfissional,
  updateProfissional,
  deleteProfissional,
  getProfissionaisPorEspecialidade
} = require('../controllers/profissionalController');

// Rotas básicas
router.route('/')
  .get(getProfissionais)
  .post(createProfissional);

router.route('/:id')
  .get(getProfissional)
  .put(updateProfissional)
  .delete(deleteProfissional);

// Rota para profissionais por especialidade
router.route('/especialidade/:especialidade')
  .get(getProfissionaisPorEspecialidade);

module.exports = router;
