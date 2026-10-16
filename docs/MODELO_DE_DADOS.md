# Modelo de dados e identificadores

## Identificação

funcionario_id: chave interna completa e permanente, gerada no servidor. UUID é um candidato; conferir duplicidade sob bloqueio antes de reservar e persistir. Não garantir unicidade apenas por probabilidade. Retomada usa ID previamente reservado. Nunca usar linha, nome, e-mail ou UUID truncado como chave primária.
email: conta corporativa obtida na sessão para login e associada a exatamente um cadastro ativo. Não substitui funcionario_id.
pasta_id, indice_id e arquivo_id: identificadores dos recursos Drive; não são o ID do funcionário.
operacao_id: identifica um pedido administrativo e suas retomadas; não é o funcionário.
Não existe coluna de matrícula.

## Funcionarios

| Coluna | Regra |
|---|---|
| funcionario_id | Texto único, completo e imutável |
| nome | Texto obrigatório; homônimos são permitidos |
| email | Conta corporativa validada e única entre ativos |
| setor | Informação profissional necessária |
| pasta_id | Pasta individual previamente validada |
| indice_id | Índice individual confiável publicado |
| ativo | SIM ou NAO; não significa revogação Drive concluída |
| data_cadastro / data_atualizacao | Datas coerentes com o fuso definido |
| revisao | Controle de alteração concorrente |

## Holerites

id, funcionario_id, competencia, arquivo_id, nome_arquivo, data_upload, responsavel_upload, status, operacao_id.
id identifica um documento. funcionario_id referencia um cadastro existente. competencia é YYYY-MM, com mês válido. responsavel_upload vem da sessão RH no servidor.
No modelo inicial: no máximo um registro ATIVO por funcionario_id + competencia. Não substituir silenciosamente. Status de documento: ATIVO ou ARQUIVADO; estados técnicos intermediários pertencem a Operacoes.

## Operacoes

operacao_id, tipo, responsavel, funcionario_id, resumo_verificavel_do_pedido, estado, fase, recursos_criados, data_inicio, data_atualizacao, codigo_erro_seguro.
Estados: EM_ANDAMENTO, CONCLUIDA, FALHA, PARCIAL. Repetir o mesmo ID com dados diferentes deve ser rejeitado. Mesmo pedido retomado preserva recursos/ID já reservados. Evitar persistir conteúdo do PDF no registro da operação.

## Auditoria

evento_id, data, responsavel, acao, funcionario_id quando aplicável, documento_id quando aplicável, operacao_id, resultado e código de erro seguro. Não registrar salários, PDF, tokens ou chaves. Planilha administrativa editável não é trilha inviolável.

## Integridade e identidade

Backend valida tipos, comprimentos, referências, campos permitidos e conteúdo que poderia virar fórmula. Sheets não impõe chaves estrangeiras: rejeitar holerite órfão e ID duplicado no código.
Mudança de e-mail conserva funcionario_id, mas atualiza permissões e índices, revogando associações antigas. E-mail reaproveitado por outra pessoa exige novo ID e nenhum acesso ao histórico anterior. Recontratação da mesma pessoa depende de decisão do RH sobre o vínculo.
