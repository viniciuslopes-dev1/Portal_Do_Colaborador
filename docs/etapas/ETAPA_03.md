# ETAPA_03 - Interface responsiva do piloto

## Identificação

Status: AGUARDANDO_TESTE. Autorização explícita do usuário após conclusão da Etapa 02. Agentes: frontend (HTML/CSS/JS), backend (templates e regressão da autenticação), segurança (revisão independente); coordenação e validação local pelo agente principal.

## Objetivo e pré-requisitos

Substituir diagnóstico de sessão por interface do portal e estrutura visual do RH com dados fictícios, preservando identidade corporativa e listas autorizadas. Projetos Google e autenticação confirmados na Etapa 02. design.md orienta somente apresentação; requisitos funcionais vigentes prevalecem.

## Escopo e arquivos previstos

Cada aplicativo terá Code.gs, Index.html, Styles.html, Scripts.html e seu manifesto. Code.gs mantém autorização e inclui apenas arquivos HTML permitidos. Portal: visão geral, perfil demonstrativo, holerites fictícios e histórico com filtro. RH: visão geral e lista demonstrativa de leitura com busca/filtro. Ajuda local e nova verificação de sessão. Sem salários, matrícula, cadastro, edição, upload, publicação, Drive/Sheets ou links reais de documentos.

Dados apresentados como demonstração, sem fingir que nome/setor fictícios pertencem à conta autenticada. E-mail da sessão vem somente do servidor. Sem dependências externas, rastreamento, senha própria ou encerramento global da sessão Google.

## Configurações e instruções

Preservar propriedades e manifestos da Etapa 02. Após revisão, copiar os arquivos HTML novos e Code.gs de cada pasta para seu respectivo projeto e atualizar implantação versionada. Não misturar arquivos dos dois projetos. Instruções finais serão acrescentadas após validação local.

## Testes e critérios de aceitação

- Regressão local da autorização e proteção dos templates.
- Conferência visual desktop/celular e interações de navegação/filtros.
- Sessão carregando, falha/negação, nova verificação e remoção dos dados da tela em revogação.
- Histórico coerente, vazio de filtro e leitura RH sem falsas operações bem-sucedidas.
- Menu mobile por teclado e Escape, foco e tabelas com rolagem.

Testes reais Apps Script, avaliação visual do usuário e testes de acessibilidade assistiva permanecem pendentes até confirmação. Simulações locais não comprovam Google OAuth ou permissões.

## Problemas, decisões e pendências

Implementação e revisões em andamento. Etapa 04 não autorizada. Funcionalidades administrativas dependem da Etapa 06. Documentar limitações de acessibilidade verificadas sem declarar conformidade WCAG por inspeção parcial.

## Conclusão e próxima ação

Etapa não concluída. Entregar arquivos revisados, evidências locais e roteiro para validação no Google; aguardar confirmação manual.

## Entrega implementada e revisão

Criados Index.html, Styles.html e Scripts.html em cada aplicativo. Atualizados ambos Code.gs para avaliar template fixo Index somente após autorização e incluir apenas Styles/Scripts por função privada. Nenhuma alteração em manifestos, propriedades ou escopos. Scripts de teste ajustados para template e allowlist. Criado scripts/preview.cjs, servidor de prévia exclusivamente local com sessão simulada e conta example.invalid; nunca copiar esse arquivo para Google nem usar como teste de autenticação real.

Interface do portal: visão geral com identificação demonstrativa explícita, conta da sessão, último holerite fictício sem duplicá-lo na lista anterior, histórico 2026/2025/2024 e estado vazio por ano. Interface RH: resumo, cinco funcionários fictícios somente leitura, busca por nome/e-mail e filtro por setor, limpeza de filtros, quantidade e estado vazio. Ambas: ajuda interna, revalidação de sessão, menu móvel, foco, estados de processamento/negação/erro e retry. PDFs desabilitados e rotulados; sem ações administrativas de etapas futuras.

Revisão independente de segurança: nenhum bloqueador concreto neste escopo. Dados dinâmicos por textContent/createElement; falha/negação/timeout limpa e oculta app e e-mail; callbacks tardios são rejeitados pelo contador de consulta. Não ampliar esta conclusão para segurança de produção.

## Evidências locais observadas

- node --test tests/auth.test.cjs: 36 testes aprovados, 0 falhas. Serviços Google simulados. Inclui parâmetros de template ignorados, include indevido rejeitado sem leitura, autorização antes de avaliar template e regressão dos bloqueios.
- Sintaxe dos scripts cliente validada; HTML formatado e inspecionado.
- Playwright em prévia local: telas desktop em viewport 1440x900 e 1920x1080; mobile 390x844; checagem adicional de overflow no portal em 320x740. Sem overflow horizontal da página nos tamanhos móveis verificados; tabelas mantêm rolagem interna.
- Portal: navegar ao histórico, selecionar 2024, observar mensagem de período vazio; menu móvel abre, Escape fecha e foco retorna a open-menu.
- RH: busca Bruno combinada a Financeiro produz 0/5 e mensagem vazia; limpar filtros restaura 5/5.
- RH: resposta simulada negada após acesso limpa conta/tabela e oculta app; erro de serviço mostra mensagem de recuperação e retry recupera acesso.
- Portal: negação simulada após acesso deixa app.hidden=true, e-mails vazios e tabela sem filhos.
- Verificados h1 único visível no RH móvel e portal 320px. Conferência visual de screenshots desktop e RH móvel sem sobreposição observada.
- Capturas/snapshots locais em output/playwright/ e .playwright-cli/, ignorados pelo Git. Favicon 404 observado inicialmente pertencia somente ao servidor de prévia e foi tratado com resposta 204 no utilitário; não era falha de execução da interface.

Sem validação completa de WCAG, leitor de tela ou zoom real de 200%. Timeout e callback tardio revisados no código, não submetidos a teste de browser específico. Novas telas ainda não implantadas/testadas no Apps Script pelo usuário.

## Como atualizar os dois projetos Google

1. Em Portal do Colaborador — TESTE, substituir Code.gs pelo arquivo de colaborador/. Criar três arquivos do tipo HTML chamados Index, Styles e Scripts; copiar integralmente o conteúdo dos .html correspondentes. O editor adiciona a extensão .html. Não copiar arquivos de rh/ nesse projeto.
2. Repetir no Painel RH — TESTE usando somente arquivos da pasta rh/. Cada projeto deve ter Code.gs, Index.html, Styles.html, Scripts.html e appsscript.json. O manifesto existente permanece válido e não mudou. Não remover propriedades privadas e manter o formato array JSON aprovado.
3. Em cada projeto: salvar tudo e abrir Implantar → Gerenciar implantações → Editar → Nova versão → Implantar. Manter execução como usuário que acessa e acesso somente à organização. Reabrir a URL /exec correspondente; salvar código sem atualizar versão não publica a interface.
4. Validar portal como A/B e painel RH como RH. Conferir conta no topo, menus, filtro de ano (2024 vazio), busca/setor no RH, celular e teclado. PDFs devem estar desabilitados; não há documento real nessa etapa.
5. Repetir teste de revogação com página aberta e Verificar sessão: deve limpar e ocultar a interface. Restaurar lista depois. Confirmar também que A/B continuam negados no RH. Não alterar permissões para facilitar teste.

## Prévia local opcional

Na raiz, executar node scripts/preview.cjs. Abrir http://127.0.0.1:4173/colaborador ou http://127.0.0.1:4173/rh. Sessão e identidade nesta prévia são simuladas, sem conexão Google. Encerrar o processo com Ctrl+C ao terminar. PORTAL_PREVIEW_PORT permite escolher outra porta. Este utilitário não é parte das implantações Apps Script.

## Aceite manual pendente

| Cenário | Esperado | Situação |
|---|---|---|
| A/B abrem portal atualizado | Conta correta, telas e histórico demonstrativo | PENDENTE |
| RH abre painel atualizado | Conta RH, resumo e busca/filtros de leitura | PENDENTE |
| A/B abrem RH | Negado pelo backend | PENDENTE de regressão real |
| Revogação com interface aberta | Tela/e-mail ocultados na consulta seguinte | PENDENTE |
| Desktop e celular | Leitura e navegação sem sobreposição, tabela rolável | PENDENTE |
| Teclado, foco, zoom 200% e leitor de tela | Operável e compreensível | PENDENTE |
| Avaliação visual do usuário | Aprovação ou ajustes registrados | PENDENTE |

Entrega local finalizada; Etapa 03 AGUARDANDO_TESTE. Etapa 04 não iniciada. Confirmar critérios manuais e autorização antes de avançar.

## Ajustes finais verificados

E-mail fictício longo testado em 320px sem overflow da página. Perfil permite quebra de palavras. Divisórias combinam transparência e recorte afinado. Menu aberto em mobile foi redimensionado a desktop: open=false e main.inert=false, preservando operação do conteúdo. Sintaxe dos dois scripts cliente revalidada após os ajustes.
