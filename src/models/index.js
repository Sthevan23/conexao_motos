const sequelize = require('../database/connection');
const { DataTypes } = require('sequelize');

// ───────────────────────── Cliente ─────────────────────────
const Cliente = sequelize.define('Cliente', {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(150), allowNull: false },
  telefone: { type: DataTypes.STRING(20), defaultValue: '' },
  cpf: { type: DataTypes.STRING(14), unique: true, allowNull: false },
  cep: { type: DataTypes.STRING(9), defaultValue: '' },
  logradouro: { type: DataTypes.STRING(200), defaultValue: '' },
  numero: { type: DataTypes.STRING(20), defaultValue: '' },
  bairro: { type: DataTypes.STRING(100), defaultValue: '' },
  cidade: { type: DataTypes.STRING(100), defaultValue: '' },
  estado: { type: DataTypes.STRING(2), defaultValue: '' },
}, { tableName: 'oficina_cliente', timestamps: false });

// ───────────────────────── Moto ─────────────────────────
const Moto = sequelize.define('Moto', {
  id_moto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  marca: { type: DataTypes.STRING(100), allowNull: false },
  modelo: { type: DataTypes.STRING(100), allowNull: false },
  placa: { type: DataTypes.STRING(10), unique: true, allowNull: false },
  ano: { type: DataTypes.INTEGER, allowNull: false },
  cor: { type: DataTypes.STRING(50), allowNull: false },
}, { tableName: 'oficina_moto', timestamps: false });

// ───────────────────────── Peça ─────────────────────────
const Peca = sequelize.define('Peca', {
  id_peca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome_da_peca: { type: DataTypes.STRING(150), allowNull: false },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  marca: { type: DataTypes.STRING(100), defaultValue: '' },
  preco_custo: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  preco_venda: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantidade_estoque: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'oficina_peca', timestamps: false });

// ───────────────────────── Servico ─────────────────────────
const Servico = sequelize.define('Servico', {
  id_servico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome_servico: { type: DataTypes.STRING(150), allowNull: false },
  descricao: { type: DataTypes.TEXT, defaultValue: '' },
  preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tempo_estimado: { type: DataTypes.STRING(20), allowNull: false },
}, { tableName: 'oficina_servico', timestamps: false });

// ───────────────────────── OrdemServico ─────────────────────────
const OrdemServico = sequelize.define('OrdemServico', {
  id_os: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  data_entrada: { type: DataTypes.DATE, allowNull: false },
  data_saida: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(20), defaultValue: 'aberto' },
  valor_total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
}, { tableName: 'oficina_ordemservico', timestamps: false });

// ───────────────────────── ItemDaOrdem ─────────────────────────
const ItemDaOrdem = sequelize.define('ItemDaOrdem', {
  id_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo_item: { type: DataTypes.STRING(10), allowNull: false }, // 'peca' | 'servico'
  id_referencia: { type: DataTypes.INTEGER, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, defaultValue: 1 },
  preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'oficina_itemdaordem', timestamps: false });

// ───────────────────────── Associations ─────────────────────────
Cliente.hasMany(Moto, { foreignKey: 'cliente_id', as: 'motos' });
Moto.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Cliente.hasMany(OrdemServico, { foreignKey: 'cliente_id', as: 'ordens_servico' });
OrdemServico.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Moto.hasMany(OrdemServico, { foreignKey: 'moto_id', as: 'ordens_servico' });
OrdemServico.belongsTo(Moto, { foreignKey: 'moto_id', as: 'moto' });

OrdemServico.hasMany(ItemDaOrdem, { foreignKey: 'ordem_servico_id', as: 'itens' });
ItemDaOrdem.belongsTo(OrdemServico, { foreignKey: 'ordem_servico_id', as: 'ordem_servico' });

module.exports = { sequelize, Cliente, Moto, Peca, Servico, OrdemServico, ItemDaOrdem };
