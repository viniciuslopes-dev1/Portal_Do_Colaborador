# Histórico do projeto novo

## 15/10/2026 - Base documental de partida

Consolidados requisitos, regras, modelo sem matrícula e plano incremental em pacote independente a pedido do usuário. funcionario_id será automático e permanente; login por e-mail corporativo. Não houve reaproveitamento de código/configurações do protótipo, criação de recursos Google ou execução de testes funcionais.
Especificação conceitual anterior foi incluída como referência, mantendo suas datas e limites de validação. As propostas de arquitetura ainda exigem homologação no ambiente novo. Todas as etapas de implementação começam NAO_INICIADA.

## 15/10/2026 - Início da Etapa 01

Usuário autorizou trabalho por etapas com agentes especializados. Iniciadas revisões de ambiente Google, backend/lógica e segurança. Frontend será tratado na etapa correspondente. Confirmado uso de design.md somente como referência visual e concluída leitura das 17 páginas do PDF inicial. Etapa 01 EM_ANDAMENTO; dados do ambiente aguardam confirmação. Nenhum recurso Google criado, código de aplicação implementado ou teste real executado.

Atualização de 15/10/2026: usuário informou armazenamentoemnuvem.com, Google Workspace Enterprise Starter e acesso administrativo. Escolhida configuração guiada pelo usuário. Conferência da assinatura/armazenamento, disponibilidade de Drives compartilhados e identificação das contas A/B/RH continuam pendentes; nenhum ajuste remoto executado.

## Confirmação do usuário - preparação do Drive

Em resposta ao bloco de criação da estrutura e teste de isolamento A/B, o usuário informou “tudo feito”. Registrado como execução e confirmação manual pelo usuário: Drive piloto e pastas Administrativo, Holerites/TESTE_A, Holerites/TESTE_B e Arquivo restrito RH; acesso individual de leitura e testes de abertura própria/negação cruzada solicitados. Não houve inspeção independente pelo agente nem coleta de links/evidências detalhadas. Isso não comprova identidade, OAuth ou autorização da aplicação, ainda não implementada.

Próxima ação: preparar dois projetos Apps Script vazios, editores restritos e fuso America/Sao_Paulo. Não implantar nem implementar autenticação nesta etapa. Canal definitivo de publicação entre projetos e validade dos índices seguem pendentes.

## Confirmação dos projetos Apps Script

Usuário respondeu “feito” ao bloco de criação de Portal do Colaborador — TESTE e Painel RH — TESTE, configuração de fuso America/Sao_Paulo, manifesto visível e edição restrita aos responsáveis técnicos. Registrado como confirmação manual do usuário, sem inspeção independente. Nenhuma implantação ou código novo foi solicitado nesse bloco.

Proposta de fechamento: aprovar apenas arquitetura do piloto com associação manual privada no servidor do portal e índices fixos controlados pelo RH. Canal automático entre projetos, validade/renovação e controle de versão vigente continuam obrigatórios antes de integração operacional nas etapas 05/06. Etapa 02 proposta: somente identidade corporativa e autorização RH, sem Drive/Sheets. Aprovação final do piloto e autorização da Etapa 02 ainda pendentes; não marcar Etapa 01 concluída.

## Etapa 02 autorizada

Usuário autorizou continuidade após proposta de fechamento do piloto e início da autenticação. Etapa 01 concluída no escopo do piloto conforme relatos manuais. Iniciada implementação local dos dois projetos, com revisão independente de segurança e consulta a fontes oficiais. Nenhuma implantação remota feita pelo agente. Resultados e testes serão registrados em ETAPA_02.md.

Etapa 02 implementada localmente, revisada por segurança e validada por 34 testes simulados (0 falhas). Criado tests/auth.test.cjs e guia de implantação/matriz em ETAPA_02.md. Nenhum teste remoto executado; status AGUARDANDO_TESTE.

Organização solicitada pelo usuário: conteúdo movido da subpasta portal-colaborador para a raiz do workspace. PDF inicial em docs/referencias/ e pedido inicial em docs/INICIAR_PROJETO.md. Criados .gitignore/.gitattributes, README atualizado e rotina de commits/push registrada em AGENTS.md. Aplicativos preservados, sem alteração funcional.

## Teste real reportado - acesso negado nos dois aplicativos

Usuário relatou mensagem “Acesso negado. Não foi possível autorizar esta conta. Procure o responsável pelo piloto.” nos dois aplicativos. Resultado real esperado de sucesso ainda não obtido; contas, propriedades e opções efetivas da implantação não foram inspecionadas pelo agente. Etapa permanece AGUARDANDO_TESTE.

Revisão do código: a mensagem cobre configuração ausente/inválida, conta não listada, identidade vazia/externa/divergente e falha de serviço. Nenhuma causa foi confirmada. Primeira rodada de diagnóstico: conferir nome exato da propriedade no respectivo projeto, array JSON com contas reais aprovadas (sem valores de exemplo), conta conectada e execução como usuário que acessa. Não mudar código ou ampliar autorização antes de identificar a causa. Propriedades são particulares de cada projeto; listas devem ser configuradas separadamente. Fontes oficiais: https://developers.google.com/apps-script/guides/properties e https://developers.google.com/apps-script/guides/web .

## Resultado do diagnóstico e confirmação do usuário

A captura enviada mostrou o valor de PILOTO_RH_EMAILS começando como string entre aspas, sem o colchete inicial do array exigido. Orientado corrigir para lista JSON, inclusive com uma única conta, salvar propriedades e conferir o mesmo formato no portal. Depois da orientação, o usuário informou “perfeito, tudo funcionando”. Registrado como sucesso dos acessos reportados pelo usuário após a correção; sem inspeção remota independente e sem registrar e-mails reais da captura.

Essa confirmação supera a falha anterior de acesso nos cenários repetidos pelo usuário. Não comprova individualmente toda a matriz: conta externa, interno não listado, remoção de autorização com página aberta e chamada direta negada permanecem sem resultado específico. Etapa 02 continua AGUARDANDO_TESTE até fechar esses critérios. Não há autorização presumida para Etapa 03.

## Confirmação dos bloqueios de autorização

Usuário respondeu “sim” à pergunta explícita sobre A/B receberem acesso negado no painel RH e conta fora da lista ser negada no portal. Esses dois cenários estão confirmados por relato manual. Não confundir conta fora da lista com conta externa: domínio da conta não foi informado. Permanecem sem confirmação específica o bloqueio externo, revogação com página aberta/RPC e revisão efetiva de implantação/consentimento. Etapa continua AGUARDANDO_TESTE; Etapa 03 não autorizada.

Etapa 02 encerrada após confirmação explícita dos testes finais: revogação com página aberta, conta externa bloqueada e implantação/consentimento conferidos. Relatos manuais do usuário e 34 testes locais simulados registrados; sem inspeção independente do Google. Etapa 03 ainda não autorizada.

## Início da Etapa 03

Usuário autorizou interface após fechamento da autenticação. Delegadas implementação frontend, adaptação do backend para templates e revisão de segurança. Registro ETAPA_03.md criado; PROGRESSO consolidado para eliminar ambiguidade de status antigos, preservados no histórico e registros das etapas.

Etapa 03 entregue localmente: três HTML por aplicativo, templates autorizados, 36 testes de backend aprovados e QA Playwright desktop/mobile em prévia simulada. Segurança revisou sem bloqueadores. Adicionado scripts/preview.cjs apenas para inspeção local; documentação de atualização no Google e aceite em ETAPA_03.md. Status AGUARDANDO_TESTE; sem implantação remota pelo agente.

## Início da Etapa 04

Usuário informou interface conferida e pediu próximo passo. Etapa 03 concluída por aceite manual. Iniciada integração de PDFs fictícios Drive no portal com agentes backend/frontend/segurança; sem desenvolvimento de cadastro/Sheets/RH operacional.

## 16/10/2026 - Entrega local da Etapa 04

Implementados Drive.gs/Drive v3 somente leitura no portal e documentos dinâmicos na interface. 72 testes locais simulados aprovados. QA browser com links Google interceptados confirmou viewer/download distintos, ausência de opener, estados de erro/vazio/pendência, filtro preservado e fallback reautorizado após correção de segurança. Mapa privado manual documentado com modelo sem dados reais. RH sem mudanças; status AGUARDANDO_TESTE no Google.

## 16/10/2026 - Download em diagnóstico

Usuário reportou testes realizados, com falha somente em Baixar PDF e sintoma inicial “Nada acontece”. Em seguida, retificou a resposta anterior: o PDF também não baixa no visualizador do próprio Drive e o botão de download não aparece. A informação vigente é a ausência de download também no Drive; a hipótese de falha exclusiva do portal foi descartada como não sustentada. Restrição de download do arquivo/Drive/política é hipótese principal, ainda sem inspeção da configuração efetiva.

Revisão não alterou ACL, escopos, canDownload ou validação dos links. Melhorada a interface em Scripts.html: resultado de ação fica visível/focado, erros de LINK_INDISPONIVEL explicam a limitação sem afirmar causa e navegação não é anunciada como download concluído. Tentativa nova continua exigindo autorização; nenhuma URL estática armazenada.

QA local adicional: resposta interceptada com Content-Disposition attachment e MIME application/pdf gerou evento download, suggestedFilename teste-download.pdf e failure=null, mesmo com popup about:blank. Isso comprova somente fluxo browser simulado; não testa PDF real ou ACL Google. Resposta LINK_INDISPONIVEL simulada agora foca action-state, mostra mensagem específica, oferece retry e fecha popup (uma aba restante). Sintaxe cliente aprovada.

Próximo diagnóstico: com RH/gestor, inspecionar restrição de download do PDF fictício em Compartilhar → Configurações e, se herdada, do Drive compartilhado. Apenas inspecionar primeiro; não mudar políticas globais, tornar público ou dar edição aos funcionários para contornar. Fontes oficiais: https://support.google.com/a/users/answer/13004062?hl=pt-BR e https://support.google.com/drive/answer/15697599?hl=pt-BR . Etapa permanece AGUARDANDO_TESTE até resolução e repetição com A/B.

## 16/10/2026 - Download confirmado no ambiente Google

A captura das configurações do Drive compartilhado mostrou a opção “Pessoas que comentaram e visualizaram” desmarcada no grupo de ações baixar/copiar/imprimir/acesso pelo Gemini. Usuário foi orientado sobre o alcance no Drive de teste e, após o ajuste manual, confirmou “agr esta baixando”. Download real passa a ser CONFIRMADO por relato do usuário; não houve mudança de ACL/configuração pelo agente nem inspeção remota independente.

A restrição de download do Drive explica o impedimento reportado; foi mantida a verificação canDownload no backend. Melhoria de mensagens da interface no commit 3d66439 permanece disponível; sua publicação no Apps Script não foi confirmada. Não é necessário novo consentimento por essa alteração manual de configuração Drive.

O usuário havia reportado os demais testes realizados, mas a conclusão da Etapa 04 ainda requer confirmação específica do isolamento A/B nos links diretos e da revogação de acesso Drive com link antigo. Não inferir esses resultados do sucesso de download. Etapa continua AGUARDANDO_TESTE até confirmação desses critérios.

## 16/10/2026 - Etapa 04 concluída

Usuário confirmou explicitamente bloqueio cruzado A/B por link direto e revogação Drive impedindo link antigo. Download e demais testes já reportados. Etapa 04 encerrada no piloto conforme relatos manuais, sem inspeção independente. Etapa 05 aguarda autorização.

## 16/10/2026 - Etapa 05 entregue para homologação

Usuário autorizou a Etapa 05 após confirmação da Etapa 04. Agentes especializados implementaram persistência RH, integração de perfil no portal, roteiro Google e revisão de segurança. Criadas Dados.gs/Piloto.gs no RH e Indices.gs no portal. UUID automático reservado sob bloqueio, operações retomáveis, quatro abas privadas e índice individual com validade de 24 horas. RH ganha consentimento Drive/Sheets; portal mantém somente leitura e substitui mapa/lista piloto por índice obrigatório. Nenhuma configuração Google foi executada pelo agente.

93 testes locais simulados aprovados; revisão independente de segurança sem bloqueadores. QA Playwright da prévia confirmou perfil/datas, bloqueio simulado de índice vencido, limpeza de perfil/documentos e recuperação; largura móvel390px sem overflow. Prévia usa identidade e documentos fictícios, não comprova Google.

Fonte de confiança requer escrita exclusiva RH/técnicos em todo Drive aprovado, inclusive concessões diretas em descendentes. Sem assinatura ou fallback antigo. Índices renovados manualmente pelo RH; vencimento no portal não revoga PDFs Drive. API media real, OAuth, ACLs, repetição e cenários A/B pendentes no roteiro ETAPA_05.md. Estado AGUARDANDO_TESTE; Etapa06 não iniciada.

## Diagnóstico de prepararBase

Usuário informou execução concluída sem criação das abas no Google. Causa ainda não identificada. prepararBase retornava erros seguros sem mostrar o retorno no editor; acrescentado log somente resultado/codigo para permitir diagnóstico, sem identidade, IDs ou detalhes de exceção. Roteiro atualizado; Etapa05 permanece AGUARDANDO_TESTE.
