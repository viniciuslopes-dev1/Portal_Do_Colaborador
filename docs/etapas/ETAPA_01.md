# ETAPA_01 - Preparação do ambiente e validação da arquitetura

## Identificação

Data: 15/10/2026. Status: CONCLUIDA (preparação do piloto).
Escopo autorizado: preparação do novo ambiente e revisão da arquitetura, com agentes especializados. Coordenação pelo agente principal; revisões de ambiente Google, backend/lógica e segurança. Frontend atuará na etapa correspondente.

## Objetivo e pré-requisitos

Verificar se o Workspace permite os dois aplicativos e o isolamento individual sem expor a planilha administrativa. Confirmar domínio, licença, acesso administrativo e contas distintas A/B/RH. Nenhuma senha ou token será registrado.

## Implementação e arquivos

Criado este registro e atualizados README, PROGRESSO, HISTORICO, DECISOES e ARQUITETURA. Nenhum código da aplicação implementado. design.md será usado apenas como referência visual; PDF inicial lido integralmente.

## Configurações e instruções

Nenhuma configuração remota aplicada. Inventário em docs/CONFIGURACAO.md permanece A_CONFIRMAR. Solicitados ao usuário os dados do ambiente e a preferência entre configuração guiada e operação pelo navegador.

## Testes e critérios de aceitação

Todos os testes reais estão PENDENTES, sem resultado observado ou evidência de aprovação:
- A e B abrem seus próprios recursos fictícios e não abrem os do outro.
- A/B não acessam raiz RH, planilha central ou arquivo restrito.
- RH autorizado administra recursos de teste sem conceder privilégios globais aos funcionários.
- Disponibilidade do Apps Script, políticas OAuth e opções de implantação conferidas no ambiente.
- Modelo de associação confiável e validade dos índices definido com limites de revogação explícitos.
Responsáveis pela execução e confirmação serão registrados após definição das contas. Revisão documental não comprova permissões reais.

## Problemas, decisões e pendências

Aguardando dados do ambiente e pareceres dos especialistas. Não adotar execução como proprietário nem compartilhamento amplo para contornar restrições. Não criar telas ou funcionalidades futuras nesta etapa.

## Conclusão e próxima ação

Etapa não concluída. Consolidar pareceres, confirmar inventário e preparar/configurar somente os recursos de teste necessários conforme autorização e acesso disponíveis. Conclusão exige evidências e confirmação dos testes manuais; Etapa 02 exige autorização explícita.


## Pareceres especializados iniciais

Revisão documental concluída por ambiente Google, backend/lógica e segurança. Nenhum teste remoto executado. Frente visual delegada apenas para delimitar o contrato da futura Etapa 03, sem implementação.

- Arquitetura viável em princípio, condicionada às políticas e permissões reais.
- Propriedades de script são particulares de cada projeto. Mapeamento manual privado pode atender ao piloto; o canal definitivo de atualização pelo RH permanece decisão obrigatória antes de aprovar a arquitetura. Fonte: https://developers.google.com/apps-script/guides/properties
- Piloto proposto: identidade corporativa associada no servidor a índice fixo, escrita restrita ao RH e leitura individual. Não descobrir índices por nome. Proposta ainda não aplicada/aprovada.
- Validade, fonte de versão vigente e revogação devem ser definidas. HMAC isolado não comprova atualidade; nenhum prazo foi configurado.
- Licença e controles do Drive precisam ser conferidos: https://support.google.com/a/answer/7337469 e https://support.google.com/a/answer/7337638
- Testar também negação de edição dos índices/PDFs por A/B e remoção de acesso a links antigos. Usar perfis separados e registrar evidências.
- Comprovação da identidade da aplicação fica na Etapa 02; preparação das políticas e viabilidade ocorre na Etapa 01. Não antecipar aprovação de autenticação nesta etapa.

Fontes adicionais: https://support.google.com/a/users/answer/12380484 ; https://developers.google.com/apps-script/guides/web ; https://developers.google.com/apps-script/reference/base/session

Atualização de 15/10/2026: usuário informou armazenamentoemnuvem.com, Google Workspace Enterprise Starter e acesso administrativo. Escolhida configuração guiada pelo usuário. Conferência da assinatura/armazenamento, disponibilidade de Drives compartilhados e identificação das contas A/B/RH continuam pendentes; nenhum ajuste remoto executado.

## Confirmação do usuário - preparação do Drive

Em resposta ao bloco de criação da estrutura e teste de isolamento A/B, o usuário informou “tudo feito”. Registrado como execução e confirmação manual pelo usuário: Drive piloto e pastas Administrativo, Holerites/TESTE_A, Holerites/TESTE_B e Arquivo restrito RH; acesso individual de leitura e testes de abertura própria/negação cruzada solicitados. Não houve inspeção independente pelo agente nem coleta de links/evidências detalhadas. Isso não comprova identidade, OAuth ou autorização da aplicação, ainda não implementada.

Próxima ação: preparar dois projetos Apps Script vazios, editores restritos e fuso America/Sao_Paulo. Não implantar nem implementar autenticação nesta etapa. Canal definitivo de publicação entre projetos e validade dos índices seguem pendentes.

## Confirmação dos projetos Apps Script

Usuário respondeu “feito” ao bloco de criação de Portal do Colaborador — TESTE e Painel RH — TESTE, configuração de fuso America/Sao_Paulo, manifesto visível e edição restrita aos responsáveis técnicos. Registrado como confirmação manual do usuário, sem inspeção independente. Nenhuma implantação ou código novo foi solicitado nesse bloco.

Proposta de fechamento: aprovar apenas arquitetura do piloto com associação manual privada no servidor do portal e índices fixos controlados pelo RH. Canal automático entre projetos, validade/renovação e controle de versão vigente continuam obrigatórios antes de integração operacional nas etapas 05/06. Etapa 02 proposta: somente identidade corporativa e autorização RH, sem Drive/Sheets. Aprovação final do piloto e autorização da Etapa 02 ainda pendentes; não marcar Etapa 01 concluída.


## Fechamento aprovado na sessão

Após apresentação dos limites do piloto, o usuário autorizou continuidade para Etapa 02. Preparação do piloto concluída conforme confirmações manuais do usuário. Registros anteriores acima são históricos: pendências de criação e aprovação da preparação foram superadas por essas confirmações e autorização. Não houve homologação independente nem aprovação de produção. Associação manual privada do piloto aceita para continuidade; publicação automática, atualidade, validade e revogação dos índices permanecem requisitos antes de integrar a operação final.
