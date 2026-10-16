# Preparação e inventário do ambiente

Inventário atualizado conforme informações do usuário em 15/10/2026. Declarações do usuário não equivalem a testes técnicos. Não registrar segredos.

| Item | Estado inicial | Evidência esperada |
|---|---|---|
| Domínio corporativo | INFORMADO: armazenamentoemnuvem.com | Confirmado pelo usuário; sem verificação remota |
| Licença e armazenamento | INFORMADO: Google Workspace Enterprise Starter; armazenamento A_CONFIRMAR | Conferir nome da assinatura, capacidade e recursos no console |
| Contas A, B e RH | A_CONFIRMAR | Identidades distintas com dados fictícios |
| Responsáveis RH | A_CONFIRMAR | Lista explícita aprovada |
| Apps Script e OAuth | A_CONFIRMAR | Serviço disponível e consentimento permitido |
| Tipo de Drive | A_CONFIRMAR | Escolha e justificativa |
| Compartilhamento individual | A_CONFIRMAR | A abre somente seus recursos; B idem |
| Planilha administrativa privada | A_CONFIRMAR | A/B não conseguem abrir |
| Retenção e correção | A_CONFIRMAR | Política aprovada pelos responsáveis |
| Limites e validade de índice | A_CONFIRMAR | Parâmetros definidos e testáveis |
| Fuso horário | A_CONFIRMAR | Consistente nos projetos e dados |

## Sequência da Etapa 01

1. Confirmar domínio, responsável administrativo e licença; conferir armazenamento e disponibilidade de Drive/Apps Script.
2. Identificar duas contas comuns e uma RH para testes; não usar PDFs reais.
3. Validar política do Drive: acesso externo bloqueado, raiz restrita e leitura individual permitida sem participação geral.
4. Criar apenas recursos de preparação autorizados e testar permissões diretamente com A/B.
5. Comparar alternativas de consulta e fechar modelo de autorização sem abrir planilha central.
6. Registrar arquitetura, decisões, evidências e pendências; pedir aprovação antes da Etapa 02.

Caminhos e opções dos consoles variam por licença/atualizações; conferir documentação oficial ao executar. Segredos serão configurados somente quando a etapa correspondente exigir. Não criar implantações de produção durante a preparação.

## Informações da sessão

Usuário confirmou acesso administrativo e escolheu configuração guiada por instruções. Não operar o navegador em seu nome. A resposta “sim para tudo” não identifica nominalmente A/B/RH: endereços e separação de privilégios ainda devem ser confirmados. Enterprise Starter é a edição informada; não substituir por Business Starter nem presumir equivalência. Primeiro bloco: conferir assinatura, armazenamento, disponibilidade de Drives compartilhados e contas existentes, sem alterar políticas gerais.

## Confirmação do usuário - preparação do Drive

Em resposta ao bloco de criação da estrutura e teste de isolamento A/B, o usuário informou “tudo feito”. Registrado como execução e confirmação manual pelo usuário: Drive piloto e pastas Administrativo, Holerites/TESTE_A, Holerites/TESTE_B e Arquivo restrito RH; acesso individual de leitura e testes de abertura própria/negação cruzada solicitados. Não houve inspeção independente pelo agente nem coleta de links/evidências detalhadas. Isso não comprova identidade, OAuth ou autorização da aplicação, ainda não implementada.

Próxima ação: preparar dois projetos Apps Script vazios, editores restritos e fuso America/Sao_Paulo. Não implantar nem implementar autenticação nesta etapa. Canal definitivo de publicação entre projetos e validade dos índices seguem pendentes.

## Confirmação dos projetos Apps Script

Usuário respondeu “feito” ao bloco de criação de Portal do Colaborador — TESTE e Painel RH — TESTE, configuração de fuso America/Sao_Paulo, manifesto visível e edição restrita aos responsáveis técnicos. Registrado como confirmação manual do usuário, sem inspeção independente. Nenhuma implantação ou código novo foi solicitado nesse bloco.

Proposta de fechamento: aprovar apenas arquitetura do piloto com associação manual privada no servidor do portal e índices fixos controlados pelo RH. Canal automático entre projetos, validade/renovação e controle de versão vigente continuam obrigatórios antes de integração operacional nas etapas 05/06. Etapa 02 proposta: somente identidade corporativa e autorização RH, sem Drive/Sheets. Aprovação final do piloto e autorização da Etapa 02 ainda pendentes; não marcar Etapa 01 concluída.

Etapa 02: configurar PILOTO_COLABORADORES_EMAILS somente no projeto do portal e PILOTO_RH_EMAILS somente no projeto RH. Valores JSON de e-mails reais aprovados, definidos diretamente em Script Properties; nenhum valor real no repositório. Manifestos USER_ACCESSING/DOMAIN e escopo único userinfo.email entregues localmente, aplicação remota ainda PENDENTE. Guia: etapas/ETAPA_02.md.
