'use strict';
const { Cliente, OrdemServico, Moto } = require('../models');

exports.list = async (req, res) => {
    const clientes = await Cliente.findAll({ order: [['nome', 'ASC']] });
    res.render('clientes/lista', { current: 'clientes', clientes });
};

exports.createForm = (req, res) => {
    res.render('clientes/form', { current: 'clientes', cliente: null, errors: {} });
};

exports.create = async (req, res) => {
    try {
        await Cliente.create(req.body);
        res.redirect('/clientes');
    } catch (err) {
        const errors = parseSequelizeErrors(err);
        res.render('clientes/form', { current: 'clientes', cliente: req.body, errors });
    }
};

exports.editForm = async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).send('Cliente não encontrado.');
    res.render('clientes/form', { current: 'clientes', cliente, errors: {} });
};

exports.edit = async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).send('Cliente não encontrado.');
    try {
        await cliente.update(req.body);
        res.redirect('/clientes');
    } catch (err) {
        const errors = parseSequelizeErrors(err);
        res.render('clientes/form', { current: 'clientes', cliente: { ...req.body, id_cliente: req.params.id }, errors });
    }
};

exports.historico = async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.id, {
        include: [{ association: 'ordens_servico', include: [{ association: 'moto' }] }],
    });
    if (!cliente) return res.status(404).send('Cliente não encontrado.');
    const ordens = cliente.ordens_servico.sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada));
    res.render('clientes/historico', { current: 'clientes', cliente, ordens });
};

function parseSequelizeErrors(err) {
    const errors = {};
    if (err.errors) {
        err.errors.forEach(e => { errors[e.path] = e.message; });
    } else {
        errors.geral = err.message;
    }
    return errors;
}
