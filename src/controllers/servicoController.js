'use strict';
const { Servico } = require('../models');

exports.list = async (req, res) => {
    const servicos = await Servico.findAll({ order: [['nome_servico', 'ASC']] });
    res.render('servicos/lista', { current: 'servicos', servicos });
};

exports.createForm = (req, res) => {
    res.render('servicos/form', { current: 'servicos', servico: null, errors: {} });
};

exports.create = async (req, res) => {
    try {
        await Servico.create(req.body);
        res.redirect('/servicos');
    } catch (err) {
        res.render('servicos/form', { current: 'servicos', servico: req.body, errors: parseErrors(err) });
    }
};

exports.editForm = async (req, res) => {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) return res.status(404).send('Serviço não encontrado.');
    res.render('servicos/form', { current: 'servicos', servico, errors: {} });
};

exports.edit = async (req, res) => {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) return res.status(404).send('Serviço não encontrado.');
    try {
        await servico.update(req.body);
        res.redirect('/servicos');
    } catch (err) {
        res.render('servicos/form', { current: 'servicos', servico: { ...req.body, id_servico: req.params.id }, errors: parseErrors(err) });
    }
};

function parseErrors(err) {
    const errors = {};
    if (err.errors) err.errors.forEach(e => { errors[e.path] = e.message; });
    else errors.geral = err.message;
    return errors;
}
