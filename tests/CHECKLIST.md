# Checklist de aceitação

Todos os itens começam PENDENTE. Registrar data, ambiente, conta/cenário fictício, resultado e evidência ao executar. Nunca preencher como aprovado só por existir código.

- [ ] Identidade A/B obtida no servidor; vazia/externa negada.
- [ ] Funcionário comum não executa nenhuma operação RH por chamada direta.
- [ ] Planilha e raiz RH inacessíveis a A/B.
- [ ] A não abre pasta, índice ou PDF de B e vice-versa, incluindo links diretos.
- [ ] Alterar e-mail/ID/arquivo no navegador não amplia acesso.
- [ ] Índice adulterado, vencido, ambíguo ou de outra pessoa rejeitado.
- [ ] Cadastro solicita apenas nome/e-mail/setor; ID gerado automaticamente.
- [ ] Colisão UUID simulada é tratada; concorrência não duplica cadastro/competência.
- [ ] Retomada mantém ID/pasta/PDF existentes; mesmo operacao_id com dados diferentes rejeitado.
- [ ] Homônimos identificados por nome/e-mail, sem cruzar documentos.
- [ ] Mudança de e-mail preserva ID e documentos; identidade antiga perde acesso.
- [ ] Reaproveitamento de e-mail por outra pessoa não dá acesso ao histórico anterior.
- [ ] Holerite com funcionário inexistente e competência inválida é rejeitado.
- [ ] Formato/tamanho de PDF e duplicidade são validados no servidor.
- [ ] Listagem, filtro, visualização, download e ausência de documentos funcionam.
- [ ] Falha entre Drive/Sheets/índice gera pendência explícita e retomada segura.
- [ ] Desativação bloqueia portal e links antigos após revogação efetiva.
- [ ] Correção/arquivamento remove exposição antiga sem exclusão indevida.
- [ ] Auditoria e erros não vazam salários, PDF, segredos ou terceiros.
- [ ] Escritas não permitem fórmulas indevidas; interface não injeta HTML de entradas.
- [ ] OAuth e identidade efetiva corretos nas duas implantações.
- [ ] Desktop/celular, desempenho, quotas e volume representativo testados.
- [ ] Retenção, suporte, restauração e aprovação interna definidos antes de produção.

Testes locais simulados complementam os testes reais; não comprovam permissões do Google. Recursos de teste e produção separados.

## Evidência local - Etapa 02

34 testes simulados aprovados por node --test tests/auth.test.cjs. Não marcar os itens integrados acima como aprovados: identidade, OAuth, links Drive e autorização real permanecem dependentes de teste no Google. Matriz e resultados manuais em docs/etapas/ETAPA_02.md.

## Confirmações manuais da autenticação piloto

Etapa 02 concluída conforme relatos explícitos do usuário: identidade A/B/RH, A/B negados no RH, conta fora da lista e externa negadas, revogação com página aberta e RPC, implantação como visitante e escopo único de e-mail. Evidência consolidada em docs/etapas/ETAPA_02.md. Itens integrados que envolvem funções administrativas e dados/documentos futuros permanecem pendentes; não confundir diagnóstico da sessão RH com operações RH ainda inexistentes.
