'use strict';
const { Peca } = require('../models');

exports.list = async (req, res) => {
    const pecas = await Peca.findAll({ order: [['nome_da_peca', 'ASC']] });
    res.render('pecas/lista', { current: 'pecas', pecas });
};

exports.createForm = (req, res) => {
    res.render('pecas/form', { current: 'pecas', peca: null, errors: {} });
};

exports.create = async (req, res) => {
    try {
        await Peca.create(req.body);
        res.redirect('/pecas');
    } catch (err) {
        res.render('pecas/form', { current: 'pecas', peca: req.body, errors: parseErrors(err) });
    }
};

exports.editForm = async (req, res) => {
    const peca = await Peca.findByPk(req.params.id);
    if (!peca) return res.status(404).send('Peça não encontrada.');
    res.render('pecas/form', { current: 'pecas', peca, errors: {} });
};

exports.edit = async (req, res) => {
    const peca = await Peca.findByPk(req.params.id);
    if (!peca) return res.status(404).send('Peça não encontrada.');
    try {
        await peca.update(req.body);
        res.redirect('/pecas');
    } catch (err) {
        res.render('pecas/form', { current: 'pecas', peca: { ...req.body, id_peca: req.params.id }, errors: parseErrors(err) });
    }
};

function parseErrors(err) {
    const errors = {};
    if (err.errors) err.errors.forEach(e => { errors[e.path] = e.message; });
    else errors.geral = err.message;
    return errors;
}
