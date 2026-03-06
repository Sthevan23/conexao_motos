from django.db import models


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=150)
    telefone = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, unique=True)
    cep = models.CharField(max_length=9, blank=True)
    logradouro = models.CharField(max_length=200, blank=True)
    numero = models.CharField(max_length=20, blank=True)
    bairro = models.CharField(max_length=100, blank=True)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=2, blank=True)

    def __str__(self):
        return self.nome


class Moto(models.Model):
    id_moto = models.AutoField(primary_key=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="motos")
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    placa = models.CharField(max_length=10, unique=True)
    ano = models.IntegerField()
    cor = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.placa} - {self.modelo}"


class Peca(models.Model):
    id_peca = models.AutoField(primary_key=True)
    nome_da_peca = models.CharField(max_length=150)
    codigo = models.CharField(max_length=50, unique=True)
    marca = models.CharField(max_length=100, blank=True)
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.nome_da_peca} ({self.codigo})"


class Servico(models.Model):
    id_servico = models.AutoField(primary_key=True)
    nome_servico = models.CharField(max_length=150)
    descricao = models.TextField(blank=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_estimado = models.DurationField(help_text="Tempo estimado (HH:MM:SS)")

    def __str__(self):
        return self.nome_servico


class OrdemServico(models.Model):
    STATUS_CHOICES = [
        ("aberto", "Aberto"),
        ("em_andamento", "Em andamento"),
        ("finalizado", "Finalizado"),
    ]

    id_os = models.AutoField(primary_key=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name="ordens_servico")
    moto = models.ForeignKey(Moto, on_delete=models.PROTECT, related_name="ordens_servico")
    data_entrada = models.DateTimeField()
    data_saida = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="aberto")
    valor_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"OS #{self.id_os} - {self.moto}"


class ItemDaOrdem(models.Model):
    TIPO_ITEM_CHOICES = [
        ("peca", "Peça"),
        ("servico", "Serviço"),
    ]

    id_item = models.AutoField(primary_key=True)
    ordem_servico = models.ForeignKey(OrdemServico, on_delete=models.CASCADE, related_name="itens")
    tipo_item = models.CharField(max_length=10, choices=TIPO_ITEM_CHOICES)
    id_referencia = models.IntegerField()
    quantidade = models.IntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Item {self.id_item} - OS {self.ordem_servico_id}"

