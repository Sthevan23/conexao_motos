'use strict';
const { fn, col, literal, Op } = require('sequelize');
const { OrdemServico, ItemDaOrdem, Peca, Servico } = require('../models');

exports.relatorios = async (req, res) => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0, 10);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const fmtDate = d => d.toISOString().slice(0, 10);

    const somarFaturamento = async (de, ate) => {
        const row = await OrdemServico.findOne({
            attributes: [[fn('SUM', col('valor_total')), 'total']],
            where: {
                status: 'finalizado',
                [Op.and]: [
                    literal(`date(data_saida) >= '${fmtDate(de)}'`),
                    literal(`date(data_saida) <= '${fmtDate(ate)}'`),
                ],
            },
            raw: true,
        });
        return parseFloat(row?.total || 0).toFixed(2);
    };

    const faturamentoDiario = await somarFaturamento(hoje, hoje);
    const faturamentoSemanal = await somarFaturamento(inicioSemana, hoje);
    const faturamentoMensal = await somarFaturamento(inicioMes, hoje);

    // Top 10 services
    const servicosMaisRealizados = await ItemDaOrdem.findAll({
        attributes: ['id_referencia', [fn('SUM', col('quantidade')), 'qtd']],
        where: { tipo_item: 'servico' },
        group: ['id_referencia'],
        order: [[literal('qtd'), 'DESC']],
        limit: 10,
        raw: true,
    });
    const srv = await Servico.findAll({ where: { id_servico: { [Op.in]: servicosMaisRealizados.map(s => s.id_referencia) } }, raw: true });
    const srvMap = {};
    srv.forEach(s => srvMap[s.id_servico] = s.nome_servico);
    servicosMaisRealizados.forEach(s => { s.nome = srvMap[s.id_referencia] || `ID ${s.id_referencia}`; });

    // Top 10 parts
    const pecasMaisVendidas = await ItemDaOrdem.findAll({
        attributes: ['id_referencia', [fn('SUM', col('quantidade')), 'qtd']],
        where: { tipo_item: 'peca' },
        group: ['id_referencia'],
        order: [[literal('qtd'), 'DESC']],
        limit: 10,
        raw: true,
    });
    const pcs = await Peca.findAll({ where: { id_peca: { [Op.in]: pecasMaisVendidas.map(p => p.id_referencia) } }, raw: true });
    const pcsMap = {};
    pcs.forEach(p => pcsMap[p.id_peca] = p.nome_da_peca);
    pecasMaisVendidas.forEach(p => { p.nome = pcsMap[p.id_referencia] || `ID ${p.id_referencia}`; });

    res.render('relatorios', {
        current: 'relatorios',
        faturamento_diario: faturamentoDiario,
        faturamento_semanal: faturamentoSemanal,
        faturamento_mensal: faturamentoMensal,
        servicos_mais_realizados: servicosMaisRealizados,
        pecas_mais_vendidas: pecasMaisVendidas,
    });
};
