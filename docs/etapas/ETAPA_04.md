# ETAPA_04 - PDFs fictícios no Drive

## Identificação

Data: 16/10/2026. Status: AGUARDANDO_TESTE. Usuário validou a Etapa 03 e autorizou o próximo passo. Agentes: backend/lógica, frontend e segurança; configuração e homologação Google feitas pelo usuário.

## Objetivo e pré-requisitos

Consultar, visualizar e baixar PDFs fictícios autorizados por identidade corporativa, incluindo isolamento em links diretos. Usar pastas de teste A/B já criadas; RH permanece demonstrativo. Sem cadastro, Sheets, publicação automatizada, upload ou criação de funcionário.

## Implementação e arquivos

Planejado: backend colaborador para leitura Drive API v3 com suporte a Drives compartilhados, escopo somente leitura adicional e associação privada temporária entre conta/pasta/lista de documentos. Interface recebe apenas documentos da conta da sessão. Cada pedido de link reautoriza e valida pertinência, tipo e pasta. Sem proxy, conteúdo PDF em logs, tokens, downloads por proprietário ou compartilhamento público.

## Contrato temporário do piloto

PILOTO_DRIVE_MAPA em Script Properties do projeto colaborador: array de registros com email, pasta_id e documentos (competencia YYYY-MM, arquivo_id). Lista é configuração privada administrada por editores aprovados, não cadastro de funcionários. E-mail identifica login e não será chave de registros de RH. funcionario_id automático permanece requisito da Etapa 05. Não descobrir documentos pelo nome nem aceitar pasta/identidade escolhida no navegador. Não introduzir assinatura/índice automático nesta etapa.

## Configurações e instruções

Pré-requisitos a detalhar após implementação: serviço avançado Drive v3 no portal, manifesto atualizado, novo consentimento de leitura e mapeamento com IDs reais fictícios de teste. RH não precisa de novo consentimento ou alterações. Não enviar credenciais ao chat nem versionar o mapa real.

## Testes e critérios de aceitação

Locais: identidade, configuração válida/inválida, IDs arbitrários e de terceiros rejeitados antes do acesso, MIME/pasta/lixeira, negação API e reautorização. Interface: lista/último/histórico dinâmicos, vazio, falha, ação/link inválido e recuperação. Testes reais: A/B listam somente seus documentos; visualizar e baixar próprios PDFs; acesso cruzado negado dentro/fora do portal; revogação efetiva de Drive também bloqueia link antigo. Sem comprovação por mocks.

## Problemas, decisões e pendências

Configuração manual é temporária do piloto. Fonte final de associação/atualidade dos índices continua para Etapa 05. Drive ACL é proteção indispensável em link direto; remover conta da lista do portal não revoga automaticamente permissões Drive.

## Conclusão e próxima ação

Etapa não concluída. Implementar, testar localmente, revisar e entregar instruções; aguardar testes reais e aprovação antes da Etapa 05.

## Implementação local entregue

- colaborador/Drive.gs: listarHolerites e obterLinkHolerite, autorização por sessão/lista em toda chamada e configuração privada revalidada antes de consultar Drive.
- colaborador/appsscript.json: serviço avançado Drive v3 e novo escopo drive.readonly. Acesso DOMAIN e execução USER_ACCESSING preservados. RH não alterado.
- colaborador/Index.html, Styles.html, Scripts.html: listagem recebida do servidor, último/histórico/anos dinâmicos, estados vazio/falha/pendência, visualização/download com nova autorização por ação. Nenhuma data de publicação inventada; aparece “Não informada” até existir fonte confiável posterior.
- tests/drive.test.cjs e tests/auth.test.cjs: regressão de autorização, referências e metadados simulados.
- docs/exemplos/PILOTO_DRIVE_MAPA.exemplo.json: modelo SEM contas/IDs reais; substituir valores e salvar somente nas propriedades privadas do portal.
- scripts/preview.cjs: adaptador local de RPCs simulados. Sem PDF real; ações locais retornam indisponível por padrão. Hooks de QA e interceptação não fazem parte do código implantado no Google.

## Regras de proteção implementadas

Mapa integral validado (campos exatos, domínio corporativo, IDs, competência, limite total de 9000 bytes UTF-8 e no máximo 100 perfis/100 documentos por perfil dentro desse limite). Não repetir e-mail, pasta ou arquivo entre perfis; não repetir competência no mesmo perfil. Um membro inválido rejeita a configuração toda. Pasta não pode ser usada como arquivo. Lista de documentos vazia em perfil válido é permitida.

ID de documento deve pertencer ao perfil da sessão antes de qualquer consulta ao Drive. A API confere folder MIME e lixeira; documento deve ser PDF, sem lixeira, com único parent direto igual à pasta configurada. Atalhos não são aceitos. Uma falha de arquivo bloqueia a lista inteira sem retorno parcial. Não consultar a pasta raiz RH, não usar busca por nome ou leitura de planilha.

Links vêm exclusivamente dos campos webViewLink (visualizar) e webContentLink (baixar), com host/caminho/ID exatos e HTTPS. Download exige capabilities.canDownload=true. Nenhum PDF, OAuth token ou blob é transportado pelo Apps Script para o navegador. Drive aplica sua ACL ao abrir o link. Escopo drive.readonly permite tecnicamente ler arquivos acessíveis à conta, embora este código restrinja pedidos ao mapa; não é permissão de compartilhamento nem escopo limitado apenas a uma pasta.

Janela abre durante clique, sem opener. Falha/timeout/callback antigo fecha janela pendente; popup bloqueado oferece botão que faz outra chamada autorizada, sem guardar URL navegável. Remover conta do portal/mapa não revoga ACL nem recolhe cópias baixadas. Revogar acesso direto exige remover permissões Drive efetivas, inclusive diretas/grupos/heranças pertinentes.

## Resultados locais observados

Comando: node --test tests/auth.test.cjs tests/drive.test.cjs. Resultado: 72 testes aprovados, zero falhas. APIs Google simuladas. Casos incluem referência A→B/ID arbitrário rejeitados antes de IO, sessão revogada, MIME/atalho/pasta/parent/lixeira/ID indevidos, erro API sem vazamento/lista parcial, canDownload=false, links HTTP/host/ID/query adulterados, mapa ausente/malformado/duplicado e lista vazia válida.

QA Playwright em prévia local:
- Documentos dinâmicos ordenados, último sem duplicação em anteriores, histórico completo e anos disponíveis.
- Seleção de 2025 preservada após Ajuda→Holerites.
- Lista vazia mostra ausência legítima; config pendente e erro de consulta mostram recuperação sem manter documentos antigos; atualização restaura lista.
- Links mockados de visualização e download foram interceptados localmente no navegador (sem acessar Google). Abas receberam os caminhos corretos e a aba de visualização apresentou opener=null. Isso não testa renderização/download de PDF real.
- Popup bloqueado simulado: primeira tentativa autorizada, botão sem href, segunda tentativa refez RPC (contador 1→2). Com sessão negada antes da segunda tentativa, app ficou oculto, e-mail limpo e tabela vazia.
- URL externa inválida simulada rejeitada, popup fechado, uma aba restante e mensagem de falha segura.
- Conferência móvel 390x844 sem overflow horizontal da página e tabela com rolagem interna. Capturas locais em output/playwright/etapa04-*.png, ignoradas pelo Git.

Revisão independente de segurança: achado de reuso de link em fallback corrigido para nova autorização em cada tentativa, conferido por leitura e QA. Sem bloqueadores concretos restantes no código revisado. Não representa homologação da API/ACL/consentimento no ambiente real.

## Configuração no Google - somente Portal do Colaborador — TESTE

### Arquivos e serviço

1. Manter Code.gs existente. Adicionar arquivo de script Drive (Drive.gs) com conteúdo de colaborador/Drive.gs. Substituir Index.html, Styles.html e Scripts.html pelos arquivos da pasta colaborador/. Não copiar arquivos de rh/ nem scripts/.
2. Substituir appsscript.json pelo manifesto atualizado de colaborador/. Ele inclui Drive v3, leitura do Drive e identidade por e-mail. Manter execução como visitante, organização e fuso America/Sao_Paulo.
3. Conferir em Serviços no editor se Drive API aparece com identificador Drive e versão v3. Se não aparecer, clicar + e adicionar Google Drive API v3. Não adicionar duas vezes nem mudar identificador. Em projeto Cloud padrão do Apps Script, a ativação ocorre com o serviço avançado; se usar um projeto Cloud próprio, conferir Drive API habilitada nele. Não trocar projeto Cloud apenas para este teste.

### Associação privada de A/B

4. Usar os PDFs fictícios e pastas TESTE_A/TESTE_B já preparados. Cada PDF deve estar diretamente dentro da respectiva pasta, sem atalho e sem subpasta intermediária. Preservar leitura individual, raiz/planilha restritas e funcionários fora da lista de membros gerais do Drive RH.
5. Copiar o ID da pasta do trecho após /folders/ na URL da pasta; copiar ID do PDF do trecho entre /file/d/ e /view. IDs não são o nome, a URL inteira nem o funcionário_id. Não enviar IDs reais ao chat/repositório.
6. Em Configurações do projeto → Propriedades do script, manter PILOTO_COLABORADORES_EMAILS e adicionar PILOTO_DRIVE_MAPA. Usar o modelo ../exemplos/PILOTO_DRIVE_MAPA.exemplo.json: substituir os e-mails pelos endereços de sessão reais de A/B e os quatro IDs pelas respectivas pastas/PDFs. Ajustar competencia para YYYY-MM do teste. O valor deve ser ARRAY JSON completo, com colchetes, aspas duplas e sem comentários. Salvar as propriedades. Uma entrada pode ter documentos:[] para testar ausência legítima. [] como mapa inteiro indica que nenhum perfil foi configurado.
7. O modelo é somente exemplo; não salvar mapa preenchido no Git. O limite de 9000 bytes vale para o JSON inteiro, não 100 documentos garantidos por usuário. Para A/B piloto é suficiente; não usar esta configuração manual como solução final para toda a empresa.

### Publicação e consentimento

8. Salvar arquivos e atualizar a implantação: Implantar → Gerenciar implantações → Editar → Nova versão → Implantar. Conferir execução como usuário que acessa e acesso somente à organização. Reabrir /exec com A/B em perfis separados.
9. Cada usuário precisará autorizar o novo escopo de leitura Drive. Não concede escrita, não compartilha arquivos e não substitui ACL. Se a política corporativa bloquear, registrar erro e revisar o aplicativo/escopos com o administrador; não abrir acesso público ou executar como proprietário para contornar.
10. O Painel RH não recebeu mudança nesta etapa e não precisa de novo consentimento ou implantação.

## Matriz de testes reais - PENDENTE

| Cenário | Esperado | Resultado/evidência |
|---|---|---|
| A/B consultam portal | Somente competências/arquivos do próprio mapa | PENDENTE |
| A/B usam Visualizar | Próprio PDF fictício abre no Drive | PENDENTE |
| A/B usam Baixar PDF | Próprio PDF fictício é baixado e abre corretamente | PENDENTE |
| A usa ID de B em RPC obterLinkHolerite | DOCUMENTO_INDISPONIVEL sem URL de B | PENDENTE |
| A abre link direto do PDF/pasta de B e vice-versa | Drive nega, fora do portal também | PENDENTE |
| Perfil A com documentos:[] | Mensagem sem holerites, sem erro | PENDENTE |
| Retirar temporariamente A da lista do portal e clicar ação já aberta | Conta negada e tela limpa; restaurar depois | PENDENTE |
| Revogar acesso de A à pasta/PDF no Drive e tentar link previamente copiado | Link antigo negado, consulta também falha; restaurar somente permissões originais após teste | PENDENTE |
| Celular, popup bloqueado e tentar novamente | Ações operáveis e nova autorização por tentativa | PENDENTE |
| RH e A/B não autorizados | RH inalterado; acesso RH continua negado a A/B | PENDENTE de regressão |

Chamada direta para testar referência indevida: no console do navegador, selecionar contexto iframe do portal e usar google.script.run.withSuccessHandler(console.log).obterLinkHolerite('ID_DO_PDF_DE_B','VISUALIZAR'). A executar como A deve receber erro sem URL. Não conceder acesso de editor para esse teste. Não alterar Code.gs para forçar identidade.

## Diagnóstico inicial

- CONFIGURACAO_PENDENTE: propriedade ausente ou conta da sessão sem entrada no mapa. Conferir e-mail da sessão e propriedade no projeto correto.
- CONFIGURACAO_INVALIDA: JSON, campos extras/ausentes, domínio, duplicidade, competência, IDs ou limite inválidos. Conferir formato e associação integral, sem colar dados reais no Git.
- DOCUMENTO_INDISPONIVEL: não comprova causa específica; conferir serviço/API, acesso real da conta, pasta direta, tipo PDF e lixeira. Teste como funcionário, não apenas editor.
- LINK_INDISPONIVEL: conferir se o Drive permite download e retornou link compatível; não montar URL pública como contorno.

## Fontes oficiais consultadas

- https://developers.google.com/apps-script/advanced/drive
- https://developers.google.com/apps-script/guides/services/advanced
- https://developers.google.com/workspace/drive/api/guides/manage-downloads
- https://developers.google.com/workspace/drive/api/reference/rest/v3/files

## Situação da entrega

Implementado e validado localmente com mocks. Etapa 04 AGUARDANDO_TESTE, sem implantação/inspeção remota pelo agente. Confirmar matriz real antes de concluir e solicitar autorização para Etapa 05.

## 16/10/2026 - Download em diagnóstico

Usuário reportou testes realizados, com falha somente em Baixar PDF e sintoma inicial “Nada acontece”. Em seguida, retificou a resposta anterior: o PDF também não baixa no visualizador do próprio Drive e o botão de download não aparece. A informação vigente é a ausência de download também no Drive; a hipótese de falha exclusiva do portal foi descartada como não sustentada. Restrição de download do arquivo/Drive/política é hipótese principal, ainda sem inspeção da configuração efetiva.

Revisão não alterou ACL, escopos, canDownload ou validação dos links. Melhorada a interface em Scripts.html: resultado de ação fica visível/focado, erros de LINK_INDISPONIVEL explicam a limitação sem afirmar causa e navegação não é anunciada como download concluído. Tentativa nova continua exigindo autorização; nenhuma URL estática armazenada.

QA local adicional: resposta interceptada com Content-Disposition attachment e MIME application/pdf gerou evento download, suggestedFilename teste-download.pdf e failure=null, mesmo com popup about:blank. Isso comprova somente fluxo browser simulado; não testa PDF real ou ACL Google. Resposta LINK_INDISPONIVEL simulada agora foca action-state, mostra mensagem específica, oferece retry e fecha popup (uma aba restante). Sintaxe cliente aprovada.

Próximo diagnóstico: com RH/gestor, inspecionar restrição de download do PDF fictício em Compartilhar → Configurações e, se herdada, do Drive compartilhado. Apenas inspecionar primeiro; não mudar políticas globais, tornar público ou dar edição aos funcionários para contornar. Fontes oficiais: https://support.google.com/a/users/answer/13004062?hl=pt-BR e https://support.google.com/drive/answer/15697599?hl=pt-BR . Etapa permanece AGUARDANDO_TESTE até resolução e repetição com A/B.

