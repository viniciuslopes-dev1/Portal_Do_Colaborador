# ETAPA_02 - Identidade corporativa e autorização

## Identificação

Status: AGUARDANDO_TESTE. Escopo autorizado pelo usuário: autenticação do piloto em dois Apps Script separados. Backend implementa; segurança revisa; agente principal valida localmente e documenta. Configuração e implantação remotas serão feitas pelo usuário.

## Objetivo e pré-requisitos

Obter identidade Google no servidor, limitar ao domínio armazenamentoemnuvem.com e negar operações RH a contas não aprovadas. Projetos vazios e edição restrita confirmados pelo usuário. Contas reais serão cadastradas diretamente nas propriedades privadas do projeto, sem precisar enviá-las ao chat.

## Implementação e arquivos

Pastas colaborador/ e rh/ conterão backend, manifesto e diagnóstico mínimo da sessão. Tela apenas de teste desta etapa; interface do produto permanece Etapa 03 NAO_INICIADA. Não acessar Drive, Sheets, PDFs, índices ou cadastrar funcionários.

## Configurações e instruções

Guia de cópia, propriedades privadas e implantação de teste será incluído após revisão. Configuração ausente ou inválida nega acesso. Nunca executar como proprietário para contornar erros.

## Testes e critérios de aceitação

Testes locais simulam Session e PropertiesService e verificam negação/permitido, manipulação de parâmetros e superfície pública. Não comprovam Google OAuth ou identidade real. Testes reais pendentes: A/B reconhecidos com seus e-mails; RH aprovado aceito; funcionário negado no RH inclusive por chamada direta; conta externa negada; execução como visitante conferida; consentimento e falhas de configuração verificados.

## Problemas, decisões e pendências

Allowlist do portal é autorização temporária do piloto; não é cadastro ativo de funcionário. Associação a cadastro/índice e desativação operacional pertencem às etapas posteriores. Identidades ativa/efetiva iguais não comprovam configuração correta se o acesso for feito pelo implantador.

## Conclusão e próxima ação

Não concluída. Aguardar implementação, revisão, testes locais e confirmação dos testes reais. Nenhuma autorização para Etapa 03 presumida.

## Entrega local revisada

Implementados colaborador/Code.gs, colaborador/appsscript.json, rh/Code.gs e rh/appsscript.json. Cada Code.gs contém o backend e HTML diagnóstico inline; não criar arquivo HTML separado. Funções públicas: doGet e obterSessao. Auxiliares terminam em _. Identidade ativa/efetiva deve coincidir; domínio exato; nenhuma identidade do navegador é aceita. Falha de serviço/configuração retorna erro genérico sem e-mail ou stack. Sem registros de dados pessoais em logs.

Configuração do piloto: PILOTO_COLABORADORES_EMAILS no portal e PILOTO_RH_EMAILS no RH. Cada propriedade exige array JSON de 1 a 100 e-mails corporativos completos, sem duplicados; membro inválido invalida a lista inteira. As listas são independentes. Nenhuma conta real foi gravada no repositório. A lista do portal não substitui o futuro cadastro ativo.

## Resultado observado localmente

Comando: node --test tests/auth.test.cjs. Resultado: 34 testes aprovados, 0 falhas. Session, PropertiesService e HtmlService simulados. Casos: autorizado; identidade vazia/efetiva diferente; externo; domínio falso; interno não listado; config ausente/vazia/JSON inválido/lista vazia/objeto/membro inválido/duplicado; falha de serviço; remoção da autorização entre chamadas; parâmetros falsos; manifesto e superfície pública. Sintaxe do script cliente também validada. Node é apenas ferramenta local de teste, não dependência do aplicativo.

Revisão independente pelo agente de segurança: nenhum bloqueador concreto no escopo desta etapa. Isso não homologa produção nem prova identidade/OAuth Google.

## Configuração guiada e implantação de TESTE

1. No projeto Portal do Colaborador — TESTE, substituir Code.gs pelo arquivo colaborador/Code.gs e appsscript.json pelo manifesto da mesma pasta. No Painel RH — TESTE, usar somente os dois arquivos de rh/. Não juntar os códigos, pois são projetos distintos.
2. Em Configurações do projeto → Propriedades do script, cadastrar PILOTO_COLABORADORES_EMAILS apenas no portal; valor é lista JSON contendo os e-mails reais A/B aprovados. No RH, cadastrar PILOTO_RH_EMAILS contendo somente contas RH aprovadas. Exemplo de formato fictício: ["conta.aprovada@armazenamentoemnuvem.com"]. Substituir pelas contas existentes; não autorizar A/B no RH só para o teste passar. Não incluir endereços do RH no portal, a menos que acesso de colaborador também seja explicitamente desejado.
3. Salvar os arquivos. Em cada projeto: Implantar → Nova implantação → Aplicativo da Web. Executar como usuário que acessa o aplicativo e limitar acesso à organização. Conferir essas escolhas no diálogo: manifesto não substitui verificação. Manter A/B sem edição no projeto. Não usar execução como proprietário nem acesso público para contornar restrições.
4. Copiar as URLs /exec e abrir em perfis separados de A/B/RH. Cada conta autoriza somente acesso ao próprio e-mail; nenhum escopo de Drive/Sheets é necessário. Não usar /dev com funcionários, pois exige edição.
5. Após alterar código, atualizar a implantação por Gerenciar implantações → Editar → Nova versão → Implantar. Alteração das propriedades é reavaliada em cada chamada; testar remoção de autorização também com página já aberta.

## Matriz real - todos PENDENTES

| Cenário | Esperado | Resultado/evidência |
|---|---|---|
| A e B, não implantadores, abrem portal | Cada um vê seu próprio e-mail e perfil COLABORADOR | PENDENTE |
| RH abre painel RH | E-mail correto e perfil RH | PENDENTE |
| A/B abrem painel RH | Acesso negado | PENDENTE |
| Interno não listado abre portal | Acesso negado | PENDENTE |
| Conta externa abre URLs | Bloqueio da organização, sem diagnóstico autorizado | PENDENTE |
| Verificar novamente | Nova autorização no servidor, mesma identidade | PENDENTE |
| Remover A temporariamente da lista do portal e usar página já aberta | Verificar novamente nega; nova abertura também nega; restaurar lista após teste | PENDENTE |
| Configuração ausente/inválida no piloto | Acesso negado; restaurar valor aprovado depois | PENDENTE |
| Chamada direta obterSessao em sessão A/B no RH | ERRO/ACESSO_NEGADO; não basta ocultar botão | PENDENTE |
| Implantação e consentimento | USER_ACCESSING, organização e escopo único conferidos | PENDENTE |

Para chamada direta, usar console de desenvolvedor no contexto iframe da página Apps Script: google.script.run.withSuccessHandler(console.log).obterSessao(). Se página negada não expuser RPC, testar revogando temporariamente autorização de uma conta piloto com página diagnóstica já aberta e invocando RPC nessa página; registrar essa limitação e não declarar teste executado sem resultado real. Não conceder acesso ao editor para executar esse teste. Não compartilhar saída contendo dados de terceiros.

## Fontes oficiais consultadas

- https://developers.google.com/apps-script/manifest/web-app-api-executable
- https://developers.google.com/apps-script/reference/base/session
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/properties
- https://developers.google.com/apps-script/concepts/deployments

## Situação de encerramento da entrega

Implementação local e testes simulados concluídos. Etapa AGUARDANDO_TESTE: copiar/configurar/implantar e executar matriz real. Não marcar CONCLUIDA até confirmação dos resultados. Etapa 03 não iniciada.

## Organização do repositório

Arquivos agora estão diretamente na raiz da pasta de trabalho, sem portal-colaborador intermediária. Caminhos relativos colaborador/, rh/, docs/ e tests/ preservados. Testes devem ser executados na raiz. Reorganização não altera implantação Google ou critérios de aprovação; testes reais continuam pendentes.
