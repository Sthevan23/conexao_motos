'use strict';
const { Op, fn, col, literal } = require('sequelize');
const { OrdemServico, Cliente, Moto, Peca, Servico, ItemDaOrdem } = require('../models');

exports.list = async (req, res) => {
    const ordens = await OrdemServico.findAll({
        include: [{ association: 'cliente' }, { association: 'moto' }],
        order: [['data_entrada', 'DESC']],
    });
    res.render('os/lista', { current: 'os', ordens });
};

exports.createForm = async (req, res) => {
    const clientes = await Cliente.findAll({ order: [['nome', 'ASC']] });
    const motos = await Moto.findAll({ include: [{ association: 'cliente' }], order: [['placa', 'ASC']] });
    const now = new Date().toISOString().slice(0, 16);
    res.render('os/form', { current: 'os', clientes, motos, errors: {}, now });
};

exports.create = async (req, res) => {
    try {
        const ordem = await OrdemServico.create({ ...req.body, valor_total: 0 });
        res.redirect(`/ordens/${ordem.id_os}`);
    } catch (err) {
        const clientes = await Cliente.findAll({ order: [['nome', 'ASC']] });
        const motos = await Moto.findAll({ include: [{ association: 'cliente' }], order: [['placa', 'ASC']] });
        res.render('os/form', { current: 'os', clientes, motos, errors: parseErrors(err), now: req.body.data_entrada });
    }
};

exports.detail = async (req, res) => {
    const ordem = await OrdemServico.findByPk(req.params.id, {
        include: [{ association: 'cliente' }, { association: 'moto' }, { association: 'itens' }],
    });
    if (!ordem) return res.status(404).send('Ordem não encontrada.');

    const itens = ordem.itens.sort((a, b) => a.id_item - b.id_item);
    const pecaIds = itens.filter(i => i.tipo_item === 'peca').map(i => i.id_referencia);
    const servicoIds = itens.filter(i => i.tipo_item === 'servico').map(i => i.id_referencia);

    const pecasMap = {};
    const servicosMap = {};
    if (pecaIds.length) (await Peca.findAll({ where: { id_peca: { [Op.in]: pecaIds } } })).forEach(p => pecasMap[p.id_peca] = p);
    if (servicoIds.length) (await Servico.findAll({ where: { id_servico: { [Op.in]: servicoIds } } })).forEach(s => servicosMap[s.id_servico] = s);

    const itensView = itens.map(i => {
        let ref_nome = '-';
        if (i.tipo_item === 'peca' && pecasMap[i.id_referencia]) ref_nome = pecasMap[i.id_referencia].nome_da_peca;
        if (i.tipo_item === 'servico' && servicosMap[i.id_referencia]) ref_nome = servicosMap[i.id_referencia].nome_servico;
        return {
            id_item: i.id_item,
            tipo_item: i.tipo_item === 'peca' ? 'Peça' : 'Serviço',
            ref_nome,
            quantidade: i.quantidade,
            preco_unitario: parseFloat(i.preco_unitario).toFixed(2),
            total_linha: (i.quantidade * parseFloat(i.preco_unitario)).toFixed(2),
        };
    });

    const pecas = await Peca.findAll({ order: [['nome_da_peca', 'ASC']] });
    const servicos = await Servico.findAll({ order: [['nome_servico', 'ASC']] });

    res.render('os/detalhe', { current: 'os', ordem, itens: itensView, pecas, servicos, errors: {} });
};

exports.addItem = async (req, res) => {
    const ordem = await OrdemServico.findByPk(req.params.id, { include: [{ association: 'itens' }] });
    if (!ordem) return res.status(404).send('Ordem não encontrada.');

    const { tipo_item, id_referencia, quantidade } = req.body;
    const qty = parseInt(quantidade, 10) || 1;
    let preco_unitario = parseFloat(req.body.preco_unitario) || 0;
    const errors = {};

    try {
        if (tipo_item === 'peca') {
            const peca = await Peca.findByPk(id_referencia);
            if (!peca) { errors.id_referencia = 'Peça não encontrada.'; throw errors; }
            if (peca.quantidade_estoque < qty) { errors.quantidade = 'Estoque insuficiente.'; throw errors; }
            if (!preco_unitario) preco_unitario = parseFloat(peca.preco_venda);
            peca.quantidade_estoque -= qty;
            await peca.save();
        } else if (tipo_item === 'servico') {
            const servico = await Servico.findByPk(id_referencia);
            if (!servico) { errors.id_referencia = 'Serviço não encontrado.'; throw errors; }
            if (!preco_unitario) preco_unitario = parseFloat(servico.preco);
        }

        await ItemDaOrdem.create({ ordem_servico_id: ordem.id_os, tipo_item, id_referencia, quantidade: qty, preco_unitario });

        // Recalculate total
        const itens = await ItemDaOrdem.findAll({ where: { ordem_servico_id: ordem.id_os } });
        const total = itens.reduce((acc, i) => acc + i.quantidade * parseFloat(i.preco_unitario), 0);
        await ordem.update({ valor_total: total });

        res.redirect(`/ordens/${ordem.id_os}`);
    } catch (err) {
        if (err === errors) {
            // validation error object we threw
            const itens2 = await ItemDaOrdem.findAll({ where: { ordem_servico_id: ordem.id_os } });
            const pecas = await Peca.findAll({ order: [['nome_da_peca', 'ASC']] });
            const servicos = await Servico.findAll({ order: [['nome_servico', 'ASC']] });
            return res.render('os/detalhe', { current: 'os', ordem, itens: itens2, pecas, servicos, errors });
        }
        console.error(err);
        res.status(500).send('Erro ao adicionar item.');
    }
};

exports.finalizar = async (req, res) => {
    const ordem = await OrdemServico.findByPk(req.params.id);
    if (!ordem) return res.status(404).send('Ordem não encontrada.');
    await ordem.update({ status: 'finalizado', data_saida: new Date() });
    res.redirect(`/ordens/${ordem.id_os}`);
};

function parseErrors(err) {
    const errors = {};
    if (err.errors) err.errors.forEach(e => { errors[e.path] = e.message; });
    else errors.geral = err.message;
    return errors;
}
