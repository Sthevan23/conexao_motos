from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('clientes/', views.cliente_list, name='cliente_list'),
    path('clientes/novo/', views.cliente_create, name='cliente_create'),
    path('clientes/<int:pk>/editar/', views.cliente_update, name='cliente_update'),
    path('clientes/<int:pk>/historico/', views.cliente_historico, name='cliente_historico'),
    path('motos/', views.moto_list, name='moto_list'),
    path('motos/nova/', views.moto_create, name='moto_create'),
    path('motos/<int:pk>/historico/', views.moto_historico, name='moto_historico'),
    path('pecas/', views.peca_list, name='peca_list'),
    path('pecas/nova/', views.peca_create, name='peca_create'),
    path('pecas/<int:pk>/editar/', views.peca_update, name='peca_update'),
    path('servicos/', views.servico_list, name='servico_list'),
    path('servicos/novo/', views.servico_create, name='servico_create'),
    path('servicos/<int:pk>/editar/', views.servico_update, name='servico_update'),
    path('ordens/', views.os_list, name='os_list'),
    path('ordens/nova/', views.os_create, name='os_create'),
    path('ordens/<int:pk>/', views.os_detail, name='os_detail'),
    path('ordens/<int:pk>/finalizar/', views.os_finalizar, name='os_finalizar'),
    path('relatorios/', views.relatorios, name='relatorios'),
]


