from datetime import date

from django.db import models
from django.db.models import Sum, Count, F
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone

from .forms import (
    ClienteForm,
    MotoForm,
    PecaForm,
    ServicoForm,
    OrdemServicoForm,
    ItemDaOrdemForm,
)
from .models import Cliente, Moto, Peca, Servico, OrdemServico, ItemDaOrdem


def dashboard(request):
    hoje = date.today()
    agora = timezone.now()

    motos_em_manutencao = (
        OrdemServico.objects.filter(status__in=["aberto", "em_andamento"]).values("moto").distinct().count()
    )

    servicos_do_dia = OrdemServico.objects.filter(data_entrada__date=hoje).count()

    faturamento_do_dia = (
        OrdemServico.objects.filter(
            status="finalizado",
            data_saida__date=hoje,
        ).aggregate(total=Sum("valor_total"))["total"]
        or 0
    )

    estoque_baixo = Peca.objects.filter(quantidade_estoque__lte=2)

    contexto = {
        "motos_em_manutencao": motos_em_manutencao,
        "servicos_do_dia": servicos_do_dia,
        "faturamento_do_dia": faturamento_do_dia,
        "estoque_baixo": estoque_baixo,
        "agora": agora,
    }
    return render(request, "oficina/dashboard.html", contexto)


def cliente_list(request):
    clientes = Cliente.objects.all().order_by("nome")
    return render(request, "oficina/clientes/lista.html", {"clientes": clientes})


def cliente_create(request):
    if request.method == "POST":
        form = ClienteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("cliente_list")
    else:
        form = ClienteForm()
    return render(request, "oficina/clientes/form.html", {"form": form})


def cliente_update(request, pk):
    cliente = get_object_or_404(Cliente, pk=pk)
    if request.method == "POST":
        form = ClienteForm(request.POST, instance=cliente)
        if form.is_valid():
            form.save()
            return redirect("cliente_list")
    else:
        form = ClienteForm(instance=cliente)
    return render(request, "oficina/clientes/form.html", {"form": form, "cliente": cliente})


def cliente_historico(request, pk):
    cliente = get_object_or_404(Cliente, pk=pk)
    ordens = cliente.ordens_servico.select_related("moto").order_by("-data_entrada")
    return render(
        request,
        "oficina/clientes/historico.html",
        {"cliente": cliente, "ordens": ordens},
    )


def moto_list(request):
    motos = Moto.objects.select_related("cliente").all().order_by("placa")
    return render(request, "oficina/motos/lista.html", {"motos": motos})


def moto_create(request):
    if request.method == "POST":
        form = MotoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("moto_list")
    else:
        form = MotoForm()
    return render(request, "oficina/motos/form.html", {"form": form})


def moto_historico(request, pk):
    moto = get_object_or_404(Moto, pk=pk)
    ordens = moto.ordens_servico.all().order_by("-data_entrada")
    return render(request, "oficina/motos/historico.html", {"moto": moto, "ordens": ordens})


def peca_list(request):
    pecas = Peca.objects.all().order_by("nome_da_peca")
    return render(request, "oficina/pecas/lista.html", {"pecas": pecas})


def peca_create(request):
    if request.method == "POST":
        form = PecaForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("peca_list")
    else:
        form = PecaForm()
    return render(request, "oficina/pecas/form.html", {"form": form})


def peca_update(request, pk):
    peca = get_object_or_404(Peca, pk=pk)
    if request.method == "POST":
        form = PecaForm(request.POST, instance=peca)
        if form.is_valid():
            form.save()
            return redirect("peca_list")
    else:
        form = PecaForm(instance=peca)
    return render(request, "oficina/pecas/form.html", {"form": form, "peca": peca})


def servico_list(request):
    servicos = Servico.objects.all().order_by("nome_servico")
    return render(request, "oficina/servicos/lista.html", {"servicos": servicos})


def servico_create(request):
    if request.method == "POST":
        form = ServicoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("servico_list")
    else:
        form = ServicoForm()
    return render(request, "oficina/servicos/form.html", {"form": form})


def servico_update(request, pk):
    servico = get_object_or_404(Servico, pk=pk)
    if request.method == "POST":
        form = ServicoForm(request.POST, instance=servico)
        if form.is_valid():
            form.save()
            return redirect("servico_list")
    else:
        form = ServicoForm(instance=servico)
    return render(request, "oficina/servicos/form.html", {"form": form, "servico": servico})


def os_list(request):
    ordens = OrdemServico.objects.select_related("cliente", "moto").order_by("-data_entrada")
    return render(request, "oficina/os/lista.html", {"ordens": ordens})


def os_create(request):
    if request.method == "POST":
        form_os = OrdemServicoForm(request.POST)
        if form_os.is_valid():
            ordem = form_os.save(commit=False)
            ordem.valor_total = 0
            ordem.save()
            return redirect("os_detail", pk=ordem.pk)
    else:
        form_os = OrdemServicoForm(initial={"data_entrada": timezone.now()})
    return render(request, "oficina/os/form.html", {"form_os": form_os})


def os_detail(request, pk):
    ordem = get_object_or_404(OrdemServico, pk=pk)
    itens = ordem.itens.all().order_by("id_item")

    if request.method == "POST":
        form_item = ItemDaOrdemForm(request.POST)
        if form_item.is_valid():
            item = form_item.save(commit=False)
            item.ordem_servico = ordem

            if item.tipo_item == "peca":
                peca = get_object_or_404(Peca, pk=item.id_referencia)
                if peca.quantidade_estoque >= item.quantidade:
                    peca.quantidade_estoque -= item.quantidade
                    peca.save()
                else:
                    form_item.add_error("quantidade", "Estoque insuficiente para esta peça.")
                    return render(
                        request,
                        "oficina/os/detalhe.html",
                        {"ordem": ordem, "itens": itens, "form_item": form_item},
                    )
                if not item.preco_unitario:
                    item.preco_unitario = peca.preco_venda

            if item.tipo_item == "servico":
                servico = get_object_or_404(Servico, pk=item.id_referencia)
                if not item.preco_unitario:
                    item.preco_unitario = servico.preco

            item.save()
            total = (
                ordem.itens.aggregate(
                    total=Sum(F("quantidade") * F("preco_unitario"))
                )["total"]
                or 0
            )
            ordem.valor_total = total
            ordem.save()
            return redirect("os_detail", pk=ordem.pk)
    else:
        form_item = ItemDaOrdemForm()

    peca_ids = [i.id_referencia for i in itens if i.tipo_item == "peca"]
    servico_ids = [i.id_referencia for i in itens if i.tipo_item == "servico"]
    pecas_map = {p.id_peca: p for p in Peca.objects.filter(id_peca__in=peca_ids)}
    servicos_map = {s.id_servico: s for s in Servico.objects.filter(id_servico__in=servico_ids)}

    itens_view = []
    for i in itens:
        ref_nome = "-"
        if i.tipo_item == "peca":
            ref_nome = getattr(pecas_map.get(i.id_referencia), "nome_da_peca", "-")
        if i.tipo_item == "servico":
            ref_nome = getattr(servicos_map.get(i.id_referencia), "nome_servico", "-")
        itens_view.append(
            {
                "id_item": i.id_item,
                "tipo_item": i.get_tipo_item_display(),
                "ref_nome": ref_nome,
                "quantidade": i.quantidade,
                "preco_unitario": i.preco_unitario,
                "total_linha": (i.quantidade or 0) * (i.preco_unitario or 0),
            }
        )

    return render(
        request,
        "oficina/os/detalhe.html",
        {"ordem": ordem, "itens": itens_view, "form_item": form_item},
    )


def os_finalizar(request, pk):
    ordem = get_object_or_404(OrdemServico, pk=pk)
    ordem.status = "finalizado"
    ordem.data_saida = timezone.now()
    ordem.save()
    return redirect("os_detail", pk=ordem.pk)


def relatorios(request):
    hoje = date.today()
    faturamento_diario = (
        OrdemServico.objects.filter(status="finalizado", data_saida__date=hoje).aggregate(
            total=Sum("valor_total")
        )["total"]
        or 0
    )

    servicos_mais_realizados = (
        ItemDaOrdem.objects.filter(tipo_item="servico")
        .values("id_referencia")
        .annotate(qtd=Sum("quantidade"))
        .order_by("-qtd")[:10]
    )

    pecas_mais_vendidas = (
        ItemDaOrdem.objects.filter(tipo_item="peca")
        .values("id_referencia")
        .annotate(qtd=Sum("quantidade"))
        .order_by("-qtd")[:10]
    )

    contexto = {
        "faturamento_diario": faturamento_diario,
        "servicos_mais_realizados": servicos_mais_realizados,
        "pecas_mais_vendidas": pecas_mais_vendidas,
    }
    return render(request, "oficina/relatorios.html", contexto)

