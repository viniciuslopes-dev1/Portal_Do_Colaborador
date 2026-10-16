# ETAPA_05 - Sheets privado e índices individuais

## Identificação

- Data: 16/10/2026.
- Status: AGUARDANDO_TESTE.
- Escopo autorizado: persistência administrativa, funcionario_id automático, cadastro piloto e publicação/consulta de índices confiáveis. Responsáveis: implementação e revisão por agentes; homologação manual pelo usuário com contas A/B/RH.
- Somente dados fictícios. Não é homologação de produção.

## Objetivo e pré-requisitos

Substituir o mapa temporário do portal por índices individuais publicados pelo RH, mantendo a planilha administrativa inacessível aos funcionários. O UUID completo é criado no servidor e permanece a chave do funcionário; e-mail identifica o login, não a chave primária.

Pré-requisitos: contas A/B/RH distintas, RH aprovado, Drive compartilhado piloto validado e projetos Apps Script separados. A confiança exige que **somente RH/técnicos explicitamente aprovados possam escrever em TODO o Drive compartilhado confiável**, inclusive pastas inferiores e arquivos compartilhados individualmente. A/B não podem ser membros com escrita, criar arquivos nessa origem ou editar índices. Um nome de arquivo igual não comprova confiança.

## Implementação e arquivos

- `rh/Dados.gs`: prepara cabeçalhos, reserva UUID sob ScriptLock, cadastra, cria recursos retomáveis, valida planilha/ACLs/referências, registra PDF existente, publica índice e registra operações/auditoria.
- `rh/Piloto.gs`: execução guiada pelo editor, sem telas ou gatilhos. Resolve IDs e reserva identificadores de operação automaticamente para repetição do mesmo pedido pela mesma conta RH.
- `rh/appsscript.json`: Drive v3, acesso ao Drive e Sheets; mantém execução como visitante e organização.
- `colaborador/Indices.gs`: descobre e valida índice na origem confiável, verifica identidade, esquema, referências, versão estável, situação e validade. Índice editável pelo funcionário é recusado.
- Arquivos de autenticação, Drive e interface dos dois aplicativos integram os fluxos existentes. A interface RH continua sem os fluxos operacionais da Etapa 06.

Implementado localmente; leitura de mídia pelo serviço avançado, OAuth e permissões reais ainda dependem dos testes abaixo. O índice contém somente o perfil individual necessário e referências, sem conteúdo de PDF ou salário; validade máxima de 24 horas.

## Configurações e instruções

### 1. Preparar armazenamento privado

No Drive compartilhado piloto confiável, mantenha `Holerites` como raiz das novas pastas dos funcionários. Crie uma Planilha Google vazia chamada `Base RH — piloto` dentro de `Administrativo`, acessível somente a usuários RH/técnicos aprovados. Não compartilhe a planilha, a raiz ou o Drive inteiro com A/B. Não use grupo, domínio ou link público nas permissões da planilha: o código exige usuários individuais aprovados.

Anote localmente três IDs distintos: ID da planilha, ID da pasta `Holerites` e ID do **Drive compartilhado**. `INDICES_DRIVE_ID` recebe o ID do Drive, não o ID de `Holerites`, `Administrativo` ou de uma pasta individual. Não publique IDs/configurações privadas no repositório.

### 2. Atualizar o projeto RH e propriedades

No Apps Script RH, copie a versão atual de `Code.gs`, `Dados.gs`, `Piloto.gs`, `Index.html`, `Styles.html`, `Scripts.html` e `appsscript.json`. Em Configurações do projeto, habilite a exibição do manifesto se necessário. Confira em Serviços o Drive API **v3**, identificador `Drive`; se usar projeto Cloud próprio, habilite também a Drive API correspondente no Cloud Console.

Em Configurações do projeto → Propriedades do script, configure:

| Propriedade RH | Valor |
|---|---|
| `PILOTO_RH_EMAILS` | Array JSON com as contas RH/técnicas aprovadas que constam das ACLs, incluindo a conta executora |
| `RH_PLANILHA_ID` | ID da nova planilha privada |
| `RH_RAIZ_HOLERITES_ID` | ID da pasta Holerites |
| `INDICES_DRIVE_ID` | ID do Drive compartilhado confiável |

Exemplo ilustrativo de allowlist: `["rh.teste@armazenamentoemnuvem.com"]`. Substitua pelo e-mail real aprovado; não use as contas A/B nessa lista.

O manifesto RH agora solicita `userinfo.email`, `drive` e `spreadsheets`. Haverá novo consentimento para leitura/escrita no Drive e Sheets; isso é necessário para criação/publicação/ACLs desta etapa. O portal permanece com e-mail e `drive.readonly`. Não reduza erros de permissão executando como proprietário.

No editor RH, conectado com a conta aprovada, selecione e execute `prepararBase`. Autorize os novos escopos. No registro deve aparecer `{"resultado":"SUCESSO","codigo":"BASE_PREPARADA"}`. Apenas “Execução concluída” não comprova sucesso; se aparecer ERRO, informar somente o código exibido para diagnóstico. Confira as abas `Funcionarios`, `Holerites`, `Operacoes` e `Auditoria`, com cabeçalhos gerados. Não digite cabeçalhos, fórmulas ou UUIDs manualmente. Uma aba vazia inicial do Google Sheets pode permanecer; não é usada.

### 3. Cadastrar A/B automaticamente

Adicione no projeto RH a propriedade `PILOTO_CADASTROS_JSON` com este formato, substituindo os e-mails pelos usuários A/B reais de teste:

```json
[
  {"nome":"Pessoa fictícia A","email":"teste.a@armazenamentoemnuvem.com","setor":"Piloto"},
  {"nome":"Pessoa fictícia B","email":"teste.b@armazenamentoemnuvem.com","setor":"Piloto"}
]
```

No editor RH, execute `executarCadastrosPiloto_`. Confira o resumo por posição no registro de execução e a aba Funcionarios. O servidor cria funcionario_id, pasta `FUNC_<uuid>` e `portal-indice.json`, publica índice por 24 horas e concede leitura individual. Não digite nem invente UUID. Se houver resultado PARCIAL, preserve os dados e propriedades `PILOTO_OP_*`; corrija a causa e repita com a mesma conta e pedido. Não apague recursos para tentar novamente.

### 4. Copiar e vincular os PDFs fictícios

Depois do cadastro, localize a nova pasta de A pelo `pasta_id` na planilha; faça o mesmo para B. Copie **somente um PDF fictício de A para a nova pasta de A e um PDF fictício de B para a nova pasta de B**. Não copie índices antigos, atalhos ou outros arquivos; a publicação recusa filhos inesperados. Use o ID da nova cópia efetivamente dentro da nova pasta. Não use o ID do PDF de origem nem das pastas da Etapa 04.

Adicione no RH `PILOTO_VINCULOS_JSON`:

```json
[
  {"email":"teste.a@armazenamentoemnuvem.com","competencia":"2026-10","arquivo_id":"SUBSTITUIR_ID_NOVA_COPIA_A"},
  {"email":"teste.b@armazenamentoemnuvem.com","competencia":"2026-10","arquivo_id":"SUBSTITUIR_ID_NOVA_COPIA_B"}
]
```

Substitua os marcadores pelos IDs reais das novas cópias. Execute `executarVinculosPiloto_` no editor RH. O helper resolve funcionario_id pelo cadastro ativo, registra o PDF e republica o índice; não faz upload ou substituição. Confira Holerites, Operacoes e Auditoria. Não adicione outro PDF antes de registrar o primeiro. Repetir o mesmo pedido deve retomar a operação sem duplicar registros.

### 5. Atualizar o portal e implantações

No projeto funcionário, copie a versão atual de `Code.gs`, `Drive.gs`, `Indices.gs`, `Index.html`, `Styles.html`, `Scripts.html` e `appsscript.json`. Confira o serviço Drive v3 e configure `INDICES_DRIVE_ID` com o mesmo ID de Drive confiável do RH.

As propriedades antigas `PILOTO_DRIVE_MAPA` e `PILOTO_COLABORADORES_EMAILS` passam a ser ignoradas pelo portal; não são alternativa ao índice e não precisam ser apagadas.

Nos dois projetos, use Implantar → Gerenciar implantações → Editar → Nova versão → Implantar. Confira execução como **usuário que acessa** e acesso somente à organização (`USER_ACCESSING`/`DOMAIN`). Teste pelas URLs `/exec`, em perfis separados A/B/RH; `/dev` não substitui esse teste. Não compartilhe os projetos-fonte com A/B.

### 6. Renovação do piloto

Os índices vencem em 24 horas e o portal nega acesso após o vencimento. Para continuar o piloto, execute manualmente `renovarIndicesPiloto_` no editor RH: ele republica os cadastros ativos. Não há gatilho automático nesta etapa. Não altere a validade no código para contornar vencimento.

## Testes e critérios de aceitação

Resultado local informado pela coordenação: **93 testes simulados aprovados**, revisão de segurança sem bloqueadores locais. Isso não comprova OAuth, ACLs, leitura `alt:media`, quotas ou permissões Google reais.

Todos os cenários manuais abaixo estão **PENDENTES**, sob responsabilidade do usuário. Registrar data, conta de teste, código/resultado observado e evidência sem dados sensíveis. Não registrar tokens, salários ou conteúdo dos PDFs.

| Cenário | Resultado esperado | Observado/evidência |
|---|---|---|
| Escrita na origem confiável | Somente RH/técnicos aprovados escrevem em todo o Drive, inclusive subpastas; A/B não editam índices nem criam arquivos nessa origem | PENDENTE |
| Planilha privada | RH aprovado abre; A/B recebem acesso negado pelo link direto; nenhuma permissão de grupo/domínio/público | PENDENTE |
| Preparar base | Quatro abas administrativas corretas, sem dados reais e sem duplicação ao repetir | PENDENTE |
| Cadastrar A/B | Dois IDs completos distintos e automáticos, pastas novas, índices individuais e operações concluídas | PENDENTE |
| Repetir helpers com mesmo pedido/conta | Não duplica UUID, pasta, índice, operação ou registro de PDF; resultado parcial retoma com os mesmos IDs | PENDENTE |
| Vincular cópias | Um PDF por funcionário/competência, arquivo na pasta correta e índice publicado com a referência correta | PENDENTE |
| Portal A/B | Cada conta vê seu perfil e PDF; abrir/baixar funciona com o consentimento real | PENDENTE |
| Acesso cruzado | A não abre PDF/índice de B nem B os de A, inclusive por links diretos; não listar dados de terceiros | PENDENTE |
| Índice falso no Meu Drive | Uma cópia com mesmo nome fora do Drive confiável é ignorada; não altera perfil/documentos autorizados | PENDENTE |
| Índice expirado | Após vencer, portal nega; renovar pelo RH restabelece somente cadastro ativo | PENDENTE |
| Índice com ativo=false | Em índice de teste publicado por responsável autorizado, portal nega acesso | PENDENTE |
| Revogação de Drive | Revogar permissões efetivas, inclusive herdadas da pasta, bloqueia também os links diretos antigos | PENDENTE |
| Escopos/identidade | RH consente Drive/Sheets; portal somente leitura Drive; ambos executam como visitante; A/B negados no RH | PENDENTE |

Para testar `ativo=false`, use somente o índice fictício e preserve seu esquema válido; restaure o cadastro ativo republicando pelo RH. Editar `ativo` na planilha, sozinho, **não atualiza o índice já publicado**. Nesta etapa, `publicarIndice` e renovação recusam cadastro com `ativo=NAO`; não existe fluxo completo de publicação da inativação. Teste de rejeição do índice não equivale a implementar desativação.

Para revogação urgente, remover acesso efetivo no Drive é indispensável: vencimento ou bloqueio no portal não revoga um PDF já acessível por link. Confira também permissões diretas nos arquivos e herdadas da pasta antes de considerar a revogação concluída. Não apagar arquivos.

## Problemas, decisões e pendências

- Escritas centralizadas no projeto RH. ScriptLock coordena execuções desse projeto; não impede edição manual nem coordena outros projetos. Drive e Sheets não oferecem uma transação única; operações parciais exigem retomada.
- A confiança é baseada na origem com escrita exclusiva aprovada, ACLs e validação integral; não há assinatura HMAC homologada. Nome igual sozinho não autoriza.
- Media real da Drive API, consentimento ampliado RH, compartilhamento individual, leitura/download e expiração ainda precisam de evidência real.
- APIs/fluxos completos de inativação, upload, correção/substituição e gestão operacional são escopo da Etapa 06. Não foram entregues por este roteiro.
- Helpers aceitam até 20 pedidos por lista, JSON de até 9000 bytes; não são importador de produção. Não apagar propriedades `PILOTO_OP_*` entre repetições.

## Referências oficiais

- [Drive avançado no Apps Script](https://developers.google.com/apps-script/advanced/drive): habilitação e API v3.
- [LockService](https://developers.google.com/apps-script/reference/lock/lock-service): alcance dos bloqueios por script.
- [Propriedades do script](https://developers.google.com/apps-script/guides/properties): configuração por projeto e armazenamento de strings.
- [Quotas do Apps Script](https://developers.google.com/apps-script/guides/services/quotas): limites sujeitos a mudanças; não confundir testes locais com validação de capacidade.
- [Implantações](https://developers.google.com/apps-script/concepts/deployments) e [manifesto de Web Apps](https://developers.google.com/apps-script/manifest/web-app-api-executable): versão implantada e identidade de execução.

## Conclusão e próxima ação

Implementação local preparada para teste guiado. Permanecer em AGUARDANDO_TESTE até registrar os resultados manuais e obter confirmação necessária do usuário. A coordenação atualiza os documentos gerais com essas evidências. Não iniciar Etapa 06 sem autorização explícita.
