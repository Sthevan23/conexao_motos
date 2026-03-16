'use strict';
const { Op, fn, col, literal } = require('sequelize');
const { OrdemServico, Peca } = require('../models');

exports.dashboard = async (req, res) => {
    try {
        const hoje = new Date();
        const hojeStr = hoje.toISOString().slice(0, 10);

        const motosEmManutencao = await OrdemServico.count({
            where: { status: { [Op.in]: ['aberto', 'em_andamento'] } },
            distinct: true,
            col: 'moto_id',
        });

        const servicosDoDia = await OrdemServico.count({
            where: literal(`date(data_entrada) = '${hojeStr}'`),
        });

        const faturRes = await OrdemServico.findOne({
            attributes: [[fn('SUM', col('valor_total')), 'total']],
            where: {
                status: 'finalizado',
                [Op.and]: literal(`date(data_saida) = '${hojeStr}'`),
            },
            raw: true,
        });
        const faturamentoDoDia = parseFloat(faturRes?.total || 0).toFixed(2);

        const estoqueBaixo = await Peca.findAll({
            where: { quantidade_estoque: { [Op.lte]: 2 } },
            order: [['nome_da_peca', 'ASC']],
        });

        res.render('dashboard', {
            current: 'dashboard',
            motos_em_manutencao: motosEmManutencao,
            servicos_do_dia: servicosDoDia,
            faturamento_do_dia: faturamentoDoDia,
            estoque_baixo: estoqueBaixo,
            agora: hoje.toLocaleString('pt-BR'),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro interno no servidor.');
    }
};
