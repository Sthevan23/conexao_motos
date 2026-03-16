'use strict';
const { Moto, Cliente } = require('../models');

exports.list = async (req, res) => {
    const motos = await Moto.findAll({ include: [{ association: 'cliente' }], order: [['placa', 'ASC']] });
    res.render('motos/lista', { current: 'motos', motos });
};

exports.createForm = async (req, res) => {
    const clientes = await Cliente.findAll({ order: [['nome', 'ASC']] });
    res.render('motos/form', { current: 'motos', moto: null, clientes, errors: {} });
};

exports.create = async (req, res) => {
    try {
        await Moto.create(req.body);
        res.redirect('/motos');
    } catch (err) {
        const clientes = await Cliente.findAll({ order: [['nome', 'ASC']] });
        const errors = parseErrors(err);
        res.render('motos/form', { current: 'motos', moto: req.body, clientes, errors });
    }
};

exports.historico = async (req, res) => {
    const moto = await Moto.findByPk(req.params.id, {
        include: [{ association: 'ordens_servico' }],
    });
    if (!moto) return res.status(404).send('Moto não encontrada.');
    const ordens = moto.ordens_servico.sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada));
    res.render('motos/historico', { current: 'motos', moto, ordens });
};

function parseErrors(err) {
    const errors = {};
    if (err.errors) err.errors.forEach(e => { errors[e.path] = e.message; });
    else errors.geral = err.message;
    return errors;
}
