from django import forms
from .models import Cliente, Moto, Peca, Servico, OrdemServico, ItemDaOrdem


def _bootstrapify(form: forms.ModelForm) -> None:
    for name, field in form.fields.items():
        widget = field.widget
        existing = widget.attrs.get("class", "")

        if isinstance(widget, forms.Select):
            base = "form-select"
        elif isinstance(widget, (forms.CheckboxInput, forms.RadioSelect)):
            base = existing
        else:
            base = "form-control"

        widget.attrs["class"] = (existing + " " + base).strip()

        if not widget.attrs.get("placeholder"):
            widget.attrs["placeholder"] = field.label or ""


class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = ["nome", "telefone", "cpf", "cep", "logradouro", "numero", "bairro", "cidade", "estado"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _bootstrapify(self)
        self.fields["cpf"].widget.attrs.update({"maxlength": "14", "placeholder": "000.000.000-00"})
        self.fields["telefone"].widget.attrs.update({"maxlength": "15", "placeholder": "(00) 00000-0000"})
        self.fields["cep"].widget.attrs.update({"maxlength": "9", "placeholder": "00000-000"})


class MotoForm(forms.ModelForm):
    class Meta:
        model = Moto
        fields = ["cliente", "marca", "modelo", "placa", "ano", "cor"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _bootstrapify(self)


class PecaForm(forms.ModelForm):
    class Meta:
        model = Peca
        fields = ["nome_da_peca", "codigo", "marca", "preco_custo", "preco_venda", "quantidade_estoque"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _bootstrapify(self)


class ServicoForm(forms.ModelForm):
    class Meta:
        model = Servico
        fields = ["nome_servico", "descricao", "preco", "tempo_estimado"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _bootstrapify(self)


class OrdemServicoForm(forms.ModelForm):
    class Meta:
        model = OrdemServico
        fields = ["cliente", "moto", "data_entrada", "status"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _bootstrapify(self)


class ItemDaOrdemForm(forms.ModelForm):
    class Meta:
        model = ItemDaOrdem
        fields = ["tipo_item", "id_referencia", "quantidade", "preco_unitario"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _bootstrapify(self)

