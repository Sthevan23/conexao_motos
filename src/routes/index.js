'use strict';
const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboardController');
const clientes = require('../controllers/clienteController');
const motos = require('../controllers/motoController');
const pecas = require('../controllers/pecaController');
const servicos = require('../controllers/servicoController');
const os = require('../controllers/osController');
const relatorios = require('../controllers/relatoriosController');

// Dashboard
router.get('/', dashboard.dashboard);

// Clientes
router.get('/clientes', clientes.list);
router.get('/clientes/novo', clientes.createForm);
router.post('/clientes/novo', clientes.create);
router.get('/clientes/:id/editar', clientes.editForm);
router.post('/clientes/:id/editar', clientes.edit);
router.get('/clientes/:id/historico', clientes.historico);

// Motos
router.get('/motos', motos.list);
router.get('/motos/nova', motos.createForm);
router.post('/motos/nova', motos.create);
router.get('/motos/:id/historico', motos.historico);

// Peças
router.get('/pecas', pecas.list);
router.get('/pecas/nova', pecas.createForm);
router.post('/pecas/nova', pecas.create);
router.get('/pecas/:id/editar', pecas.editForm);
router.post('/pecas/:id/editar', pecas.edit);

// Serviços
router.get('/servicos', servicos.list);
router.get('/servicos/novo', servicos.createForm);
router.post('/servicos/novo', servicos.create);
router.get('/servicos/:id/editar', servicos.editForm);
router.post('/servicos/:id/editar', servicos.edit);

// Ordens de Serviço
router.get('/ordens', os.list);
router.get('/ordens/nova', os.createForm);
router.post('/ordens/nova', os.create);
router.get('/ordens/:id', os.detail);
router.post('/ordens/:id/item', os.addItem);
router.post('/ordens/:id/finalizar', os.finalizar);

// Relatórios
router.get('/relatorios', relatorios.relatorios);

module.exports = router;
