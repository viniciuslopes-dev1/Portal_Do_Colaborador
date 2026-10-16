# Portal do Colaborador

Documentação explicativa do projeto e das oito etapas

Edição de 16/10/2026. Público: RH, responsáveis pelo Google Workspace e equipe de desenvolvimento. Este guia consolida a situação registrada no repositório nesta data; não comprova uma implantação de produção.

## Como ler esta documentação

Comece pela visão geral para entender as partes do sistema. Depois leia a etapa desejada, seus pré-requisitos, o procedimento e os critérios de aceite. A documentação inicial de 17 páginas continua preservada em `docs/referencias/Portal_do_Colaborador_Documentacao_Novo_Projeto.pdf`; ela descreve uma proposta anterior ao desenvolvimento. Este guia explica a evolução e a situação vigente.

Há três níveis diferentes de informação: **planejado** descreve o que ainda se pretende construir; **implementado** significa que o código existe; **validado** exige evidência do comportamento. Testes locais com serviços simulados não comprovam identidade, consentimento OAuth, permissões ou capacidade reais do Google.

Os registros `docs/etapas/ETAPA_01.md` a `ETAPA_05.md` guardam a sequência histórica, inclusive falhas e pendências posteriormente resolvidas. Para conhecer o estado atual, leia os fechamentos desses registros e `docs/PROGRESSO.md`. Os capítulos 06 a 08 deste guia são planejamento documental: não iniciam essas etapas.

| Etapa | Situação em 16/10/2026 | Limite da evidência |
|---|---|---|
| 01 - Preparação | CONCLUIDA no piloto | Confirmação manual do usuário |
| 02 - Autenticação | CONCLUIDA no piloto | Testes locais e confirmação manual |
| 03 - Interface | CONCLUIDA no piloto | Conferência local e aceite do usuário |
| 04 - Drive | CONCLUIDA no piloto | Download, isolamento e revogação confirmados |
| 05 - Sheets e índices | AGUARDANDO_TESTE | Implementação local; testes Google pendentes |
| 06 - Painel RH | NAO_INICIADA | Planejamento sujeito a autorização |
| 07 - Segurança integrada | NAO_INICIADA | Planejamento sujeito a autorização |
| 08 - Publicação | NAO_INICIADA | Planejamento sujeito a autorização |

## Visão geral do projeto

O portal atende uma empresa com 31 a 100 funcionários. Cada pessoa entra com sua conta Google corporativa para consultar o próprio perfil e visualizar ou baixar holerites em PDF. O RH terá um aplicativo separado para administrar cadastros, documentos e permissões. O Google Sites será a entrada institucional do serviço.

O sistema não calcula folha de pagamento nem gera holerites. Os PDFs são preparados fora do portal. Também ficam fora do escopo inicial: ponto, ERP, assinatura eletrônica e criação de contas ou licenças Workspace. Cadastrar uma pessoa no portal não cria uma conta Google.

### O papel de cada tecnologia

| Componente | Função explicada |
|---|---|
| HTML | Organiza títulos, tabelas, formulários e botões |
| CSS | Define a aparência e a adaptação ao celular |
| JavaScript no navegador | Controla navegação, filtros e pedidos ao servidor |
| Google Apps Script | Executa regras de negócio e acessa os serviços Google |
| Google Workspace | Fornece contas corporativas e políticas administrativas |
| Google Drive | Guarda PDFs e índices e aplica permissões de arquivos |
| Google Sheets privado | Guarda cadastro, referências e registros do RH |
| Google Sites | Apresenta a entrada institucional do portal |
| JSON e Markdown | Representam dados estruturados e documentação |

O aplicativo usa HTML, CSS e JavaScript, incluindo JavaScript em arquivos `.gs` no servidor. Node.js serve aos testes e à prévia locais. Python é usado apenas para produzir esta documentação PDF; nenhum dos dois é requisito para o funcionário acessar o portal.

### Dois aplicativos independentes

O portal do funcionário e o painel RH possuem projetos Apps Script separados. Isso permite limitar as permissões de cada um e revisar o consentimento correspondente. A execução deve ocorrer como o usuário que acessa, com acesso restrito à organização, conforme a configuração e os testes do piloto.

Fluxo de consulta: conta corporativa > servidor do portal > índice individual confiável > documentos próprios no Drive. O Google Sites será adicionado como entrada na Etapa 08; ele não substitui a autorização do aplicativo.

Fluxo administrativo: conta RH aprovada > servidor RH > planilha privada e Drive > publicação do índice individual. Na situação atual, os procedimentos da Etapa 05 são executados pelo editor Apps Script; as telas administrativas continuam demonstrativas.

O consentimento OAuth permite ao aplicativo solicitar operações em nome da conta, dentro dos escopos autorizados. Ele não compartilha automaticamente um arquivo privado. As permissões do Drive e da planilha continuam sendo necessárias. Referência: documentação oficial de Web Apps e compartilhamento, listada ao final.

### Por que existe um índice individual

O funcionário não pode abrir a planilha administrativa. Para entregar somente o perfil e os documentos daquela pessoa, o RH publica um pequeno arquivo JSON chamado `portal-indice.json` em sua pasta individual. Esse arquivo contém as referências necessárias à consulta, sem conteúdo do PDF nem valores salariais.

Na Etapa 05, o portal aceita índices apenas da origem configurada em `INDICES_DRIVE_ID`, com destinatário correspondente à identidade obtida no servidor, esquema válido, situação ativa e prazo vigente. Também confere parentesco e versão estável. Um arquivo com nome igual fora da origem confiável não autoriza acesso.

A confiança depende da exclusividade de escrita de RH/técnicos aprovados em toda a árvore do Drive confiável. A/B devem receber somente leitura de seus próprios recursos. Não existe assinatura HMAC homologada nesta implementação. Essa premissa administrativa ainda precisa de confirmação nos testes Google da Etapa 05.

Os índices duram no máximo 24 horas e são renovados manualmente nesta etapa. O vencimento bloqueia novas operações do portal, mas não retira por si só uma permissão já existente no Drive. Uma revogação urgente precisa alcançar os arquivos e as permissões efetivas.

### Identificadores sem matrícula

Não existe matrícula no cadastro, nos formulários, no painel ou nos relacionamentos. O servidor gera `funcionario_id` como UUID completo, verifica colisões sob bloqueio e reserva o identificador da operação. O RH não digita esse ID e o funcionário não precisa conhecê-lo.

O e-mail corporativo identifica o login. O `funcionario_id` identifica o cadastro e permanece igual se nome ou setor mudarem. Uma futura troca de e-mail precisa atualizar a associação de identidade e revogar permissões antigas. Conhecer qualquer ID não concede acesso.

| Identificador | O que representa |
|---|---|
| funcionario_id | Cadastro interno permanente da pessoa |
| pasta_id | Pasta individual real no Google Drive |
| indice_id | Arquivo individual de referências |
| arquivo_id | PDF real no Drive |
| operacao_id | Pedido administrativo e suas retomadas |

### Estrutura de armazenamento e cadastro

No Drive piloto, `Administrativo` guarda a planilha privada; `Holerites` contém as pastas `FUNC_<uuid>`; `Arquivo restrito RH` destina-se aos documentos arquivados conforme política a aprovar. Os nomes são lógicos: os IDs reais ficam somente na configuração privada e nos registros autorizados.

| Aba privada | Conteúdo e finalidade |
|---|---|
| Funcionarios | ID, nome, e-mail, setor, referências Drive, situação e revisão |
| Holerites | Vínculo ao funcionário, competência, referência PDF e estado |
| Operacoes | Fases, recursos reservados e controle de retomada |
| Auditoria | Responsável, ação, referências e resultado administrativo |

O modelo inicial aceita um holerite ativo por funcionário e competência, no formato `YYYY-MM`. Complementares precisam de decisão específica. Sheets não impõe os relacionamentos automaticamente: o backend valida referências, duplicidades e entradas indevidas. A auditoria em planilha editável não é uma trilha inviolável.

### Regras que orientam todas as etapas

- A identidade vem do servidor. Identidade vazia, externa ou inválida resulta em acesso negado.
- Toda operação exige autorização no backend. Pertencer ao domínio não torna alguém RH.
- Funcionários não recebem acesso à planilha central, à raiz administrativa ou aos documentos de terceiros.
- Não usar links públicos, execução como proprietário ou compartilhamento geral para resolver falhas de permissão.
- Não registrar salários, conteúdo de PDFs, tokens, chaves ou configurações privadas no Git e nos logs.
- Usar somente dados fictícios até homologação. Não apagar arquivos ou dados sem autorização.
- Cada etapa exige testes, registro das evidências e autorização explícita antes da seguinte.

## Etapa 01 - Preparação do ambiente

**Situação: CONCLUIDA no escopo do piloto.** O fechamento foi registrado por confirmação manual do usuário; não houve inspeção remota independente nem homologação de produção.

### Objetivo e resultado esperado

Conferir se o ambiente Google permite dois aplicativos independentes e o compartilhamento individual de PDFs sem abrir a planilha administrativa. A etapa prepara a base do piloto antes de escrever funcionalidades de consulta ou cadastro.

O resultado é um ambiente de teste organizado, com contas distintas e responsabilidades claras. A viabilidade real depende da licença, das políticas de OAuth e das configurações de compartilhamento da organização. Não se deve presumir capacidade ilimitada pelo uso do Workspace.

### Pré-requisitos e recursos envolvidos

É necessário um responsável com acesso administrativo, contas de teste A/B/RH e disponibilidade dos serviços Google. Os recursos são o Drive piloto, pastas administrativas e individuais e dois projetos Apps Script vazios. O fuso definido é `America/Sao_Paulo`.

Arquivos de referência: `docs/CONFIGURACAO.md`, `docs/ARQUITETURA.md`, `docs/SEGURANCA.md` e `docs/etapas/ETAPA_01.md`. Esta etapa não entrega código funcional do portal.

### Procedimento explicado

1. Conferir assinatura, armazenamento disponível, acesso ao Apps Script e políticas de compartilhamento no ambiente administrativo. Registrar somente informações necessárias, preservando contas e configurações privadas.
2. Organizar o Drive de teste em Administrativo, Holerites/TESTE_A, Holerites/TESTE_B e Arquivo restrito RH. Dar leitura individual apenas ao recurso fictício correspondente, preservando as áreas privadas.
3. Usar perfis de navegador separados para A e B. Cada conta deve abrir o próprio recurso e receber acesso negado ao recurso da outra e às áreas administrativas.
4. Criar os projetos Portal do Colaborador - TESTE e Painel RH - TESTE. Restringir os editores aos responsáveis e definir o fuso. Não juntar os projetos.
5. Registrar o modelo de confiança e os limites da preparação. Os testes de identidade da aplicação pertencem à Etapa 02; a preparação do Drive não comprova o login do portal.

### Evidências, aceite e dificuldades

O usuário confirmou a preparação do Drive e dos projetos Apps Script. O aceite permitiu continuar para a autenticação piloto. Os registros preservam que a associação manual era temporária; o índice e sua validade foram detalhados na Etapa 05.

Se o compartilhamento individual não funcionar, revisar as políticas e o modelo do piloto com o responsável. Não compartilhar a raiz ou a planilha com todos. O critério de aceite é viabilidade registrada e isolamento dos recursos de teste conforme confirmação necessária.

### Relação com a próxima etapa

A preparação foi aceita para o piloto. A autenticação foi autorizada e tratada na Etapa 02. Isso não transforma a preparação em aprovação de produção. Consulte o registro original para a sequência completa das confirmações.

## Etapa 02 - Autenticação e autorização

**Situação: CONCLUIDA no piloto.** Houve 34 testes locais simulados nessa entrega e confirmação manual dos cenários finais pelo usuário. A configuração evoluiu nas etapas seguintes.

### Objetivo e funcionamento

Identificar a conta Google no servidor e decidir se ela pode entrar no aplicativo solicitado. Autenticação responde quem é a pessoa; autorização determina o que ela pode acessar. Não existe senha criada pelo portal.

O backend consulta a sessão, valida domínio e regras de acesso e nega identidade indisponível. Comparar identidade ativa e efetiva é uma defesa adicional; testar somente com o implantador não comprova execução como visitante. Cada chamada pública precisa repetir a autorização.

### Arquivos e pré-requisitos

Na entrega original, cada projeto recebeu `Code.gs` e `appsscript.json`, com diagnóstico de sessão. As listas privadas eram `PILOTO_COLABORADORES_EMAILS` no portal e `PILOTO_RH_EMAILS` no RH. As propriedades pertencem ao respectivo projeto e não são compartilhadas automaticamente.

**Atenção à versão atual:** a lista de colaboradores deixou de autorizar o portal na Etapa 05. O portal atual exige índice individual ativo e válido. A lista explícita RH continua necessária. Não implantar arquivos antigos isolados sobre o código atual para reproduzir esta etapa.

### Roteiro para compreender a implantação

1. Separar arquivos e propriedades por aplicativo. Na configuração histórica de teste, uma lista JSON válida tem formato de array, mesmo com uma única conta. Valores privados não vão para o repositório.
2. No Apps Script, usar Implantar > Nova implantação > Aplicativo da Web. Conferir execução como usuário que acessa e acesso somente à organização, sem conceder edição do código a A/B.
3. Abrir as URLs `/exec` em perfis separados. `/dev` é destinado a testes por editores e não substitui a implantação usada pelos funcionários.
4. Conferir a identidade exibida e os acessos esperados. RH autorizado entra no painel; A/B não entram no RH. Conta externa ou sem autorização deve ser negada.
5. Remover temporariamente uma autorização do piloto e pedir nova verificação com a página aberta. O servidor deve negar a chamada seguinte; depois restaurar apenas a configuração aprovada.

### Testes e problema resolvido

Os testes locais cobriram identidade vazia, domínio indevido, configuração inválida, remoção de autorização e falhas de serviço. O usuário confirmou acessos A/B/RH, bloqueios, revogação com página aberta, conta externa e opções de implantação/consentimento.

Uma falha inicial foi associada ao formato da lista privada: o valor estava como string em vez de array JSON. O acesso passou a funcionar após a correção reportada pelo usuário. Não registrar os e-mails reais usados no diagnóstico.

O aceite vale para a autenticação piloto. Integrações Drive, cadastro ativo e índices foram tratadas depois e exigem seus próprios testes. Fonte detalhada: `docs/etapas/ETAPA_02.md`.

## Etapa 03 - Interface responsiva

**Situação: CONCLUIDA no piloto.** A interface foi conferida e aceita pelo usuário. A entrega original usava dados fictícios e não implementava ações administrativas.

### Objetivo e experiência de uso

Transformar o diagnóstico de sessão em telas compreensíveis para funcionário e RH. No portal, a pessoa encontra visão geral, perfil e histórico de holerites. No RH, a estrutura visual mostra resumo, lista, busca e filtros demonstrativos.

Uma interface responsiva se adapta ao tamanho da tela. Ela precisa permitir leitura no celular, navegação por teclado e estados claros para carregamento, ausência de resultados, acesso negado e erro. Esconder um botão não substitui autorização no servidor.

### Arquivos e limites da entrega

Cada aplicativo recebeu `Index.html`, `Styles.html` e `Scripts.html`; `Code.gs` passou a montar o template somente após autorizar a sessão. A referência `docs/design.md` orientou a apresentação, sem criar regras de cadastro ou autenticação.

Os dados demonstrativos eram identificados como demonstração. Ações de PDF ficavam desabilitadas. As etapas 04 e 05 depois conectaram o portal a documentos e perfil individuais. O painel RH permanece demonstrativo na situação atual.

### Atualização e conferência explicadas

1. No editor de cada projeto, manter os arquivos da própria pasta. Os arquivos HTML são criados como Index, Styles e Scripts; o editor acrescenta a extensão. Preservar as propriedades privadas.
2. Salvar e atualizar a implantação em Implantar > Gerenciar implantações > Editar > Nova versão > Implantar. Salvar código sem atualizar a versão não publica a mudança na URL versionada.
3. Abrir o portal como A/B e o painel como RH. Conferir menus, leitura, filtros e mensagens em desktop e celular. Repetir A/B negados no RH.
4. Conferir a retirada dos dados da tela quando a nova verificação de sessão é negada. Dados de uma sessão anterior não devem permanecer visíveis após o bloqueio tratado pela interface.

### Evidências e critérios de aceite

Foram registrados 36 testes simulados de autenticação/templates e verificações locais no navegador em tamanhos desktop e mobile, incluindo 320 pixels de largura. Houve conferência de filtros vazios, menu por teclado/Escape, foco e limpeza da tela após negação simulada.

O usuário informou que conferiu a interface e autorizou o passo seguinte. Isso encerrou a etapa no piloto. Não foi emitida certificação WCAG nem validação completa com leitor de tela e zoom de 200%; essas verificações devem integrar a homologação apropriada.

Fonte detalhada: `docs/etapas/ETAPA_03.md`. A prévia `scripts/preview.cjs` é somente local e simula sessão; nunca deve ser copiada para o Apps Script.

## Etapa 04 - Consulta de PDFs no Drive

**Situação: CONCLUIDA no piloto.** O usuário confirmou visualização/download, isolamento cruzado A/B e revogação de link antigo. Os testes locais dessa entrega totalizaram 72 cenários simulados.

### Objetivo e fluxo de consulta

Permitir que o funcionário liste, visualize e baixe apenas PDFs fictícios associados à própria conta. A listagem não concede acesso a qualquer ID fornecido pelo navegador: o servidor reautoriza e valida a referência antes de retornar um link permitido.

Além da autorização do portal, o Drive aplica suas permissões quando o link é aberto. Por isso, o teste de segurança também precisa abrir links diretos como A e B. Um botão escondido ou uma lista filtrada não comprovam isolamento dos arquivos.

### Arquivos, configurações e evolução

A entrega acrescentou `colaborador/Drive.gs`, Drive API v3 e escopo `drive.readonly` no portal. O RH permaneceu demonstrativo. O mapa temporário `PILOTO_DRIVE_MAPA` associava conta, pasta e documentos fictícios no servidor.

**Situação vigente:** esse mapa foi substituído pelos índices da Etapa 05 e não autoriza mais o portal. A integração Drive atual usa o índice individual. O consentimento do portal continua de leitura; os escopos de escrita pertencem ao projeto RH.

### Como verificar o comportamento

1. Preparar PDFs totalmente fictícios e permissões individuais no Drive de teste. Não usar holerites reais para validar interface ou isolamento.
2. Com a versão correspondente configurada, abrir como A e B. Conferir que cada conta vê somente seus documentos e competências.
3. Pedir Visualizar e Baixar. O backend confere associação, tipo PDF, pasta e condições do arquivo antes de entregar o link. Cada nova tentativa exige nova autorização.
4. Copiar o link de um PDF de A e tentar abri-lo como B; repetir no sentido contrário. Ambos devem receber bloqueio. Testar também manipulação de referência na chamada da aplicação.
5. Revogar temporariamente a permissão efetiva de A no recurso de teste e tentar um link antigo. O link deve deixar de abrir. Restaurar somente as permissões originais ao encerrar o teste.

### Download: ocorrência e resolução

O usuário relatou que Baixar não funcionava e depois confirmou a ausência de download também no visualizador Drive. A configuração do Drive compartilhado restringia baixar/copiar/imprimir para leitores. Após ajuste manual no ambiente de teste, o usuário confirmou o download.

O backend preservou a verificação `canDownload`; a interface recebeu mensagens mais claras e tratamento de nova tentativa. Não foi criado link público nem ampliado o acesso de funcionários a editores. Em nova falha, revisar capacidade de download e política efetiva com o responsável, sem presumir a mesma causa.

### Evidência e limite do aceite

A confirmação final cobriu A não abrir o PDF de B, o inverso e bloqueio de link antigo após revogação. São relatos manuais do piloto, sem inspeção remota independente. Eles não homologam os índices e o cadastro introduzidos na etapa seguinte.

Fonte detalhada: `docs/etapas/ETAPA_04.md`. Para o procedimento atual de associação dos PDFs, usar a Etapa 05.

## Etapa 05 - Sheets privado e índices individuais

**Situação: AGUARDANDO_TESTE.** Cadastro e publicação foram implementados localmente. O repositório registra 93 testes simulados aprovados e revisão de segurança sem bloqueadores locais. OAuth, permissões e leitura real no Google continuam pendentes.

### Objetivo e mudança de arquitetura

Trocar o mapa manual temporário por cadastro privado e índice individual publicado pelo RH. O funcionário deixa de depender de uma lista provisória de contas e precisa de cadastro ativo representado em um índice confiável, vigente e destinado à sua identidade.

O servidor RH gera o UUID completo, confere duplicidade sob `ScriptLock`, reserva recursos e registra as fases da operação. Uma retomada conserva IDs e recursos já criados. Não há transação única entre Drive e Sheets; falhas parciais precisam ser reconhecidas e retomadas.

### Arquivos e pré-requisitos

`rh/Dados.gs` reúne persistência, validação e publicação. `rh/Piloto.gs` contém execução guiada pelo editor. `colaborador/Indices.gs` valida a origem, identidade, esquema, situação, validade e referências do índice. Os manifestos e fluxos de consulta integram essa mudança.

São necessárias contas distintas A/B/RH, Drive compartilhado confiável, planilha privada e escrita exclusiva de RH/técnicos aprovados em toda a árvore. A/B não podem criar ou editar arquivos nessa origem; recebem apenas leitura da própria pasta. Isso ainda precisa ser confirmado no Google.

### Bloco 1 - Preparar a base privada

Criar uma planilha vazia de piloto em Administrativo, acessível somente a usuários RH/técnicos explicitamente aprovados. Não compartilhar com grupos, domínio ou A/B. Identificar privadamente a planilha, a pasta Holerites e o Drive compartilhado: são três recursos diferentes.

No projeto RH, copiar os arquivos atuais da pasta `rh/`, conferir Drive API v3 e preencher as propriedades abaixo. No Apps Script, propriedades ficam em Configurações do projeto > Propriedades do script. Os valores reais não devem aparecer no Git.

| Propriedade | Finalidade |
|---|---|
| PILOTO_RH_EMAILS | Array JSON das contas RH/técnicas aprovadas |
| RH_PLANILHA_ID | ID da planilha privada |
| RH_RAIZ_HOLERITES_ID | ID da pasta Holerites |
| INDICES_DRIVE_ID | ID do Drive compartilhado confiável, não de uma pasta |

Executar `prepararBase` no editor RH e autorizar os escopos necessários. O RH solicita e-mail, Drive e Sheets; o portal permanece com e-mail e leitura do Drive. Conferir o resultado `BASE_PREPARADA` e as abas Funcionarios, Holerites, Operacoes e Auditoria. Apenas a mensagem genérica de execução concluída não comprova sucesso da operação.

### Bloco 2 - Cadastrar e vincular dados fictícios

Configurar `PILOTO_CADASTROS_JSON` com uma lista de objetos contendo somente nome, email e setor para A/B. Executar `executarCadastrosPiloto`. O servidor cria o cadastro, a pasta `FUNC_<uuid>` e o índice. Não preencher UUID, cabeçalhos ou referências técnicas manualmente.

Localizar as novas pastas pelo cadastro e copiar um PDF fictício de A para a pasta de A e um de B para a pasta de B. Registrar os IDs das novas cópias; não usar os arquivos antigos da Etapa 04 como se já pertencessem às novas pastas.

Configurar `PILOTO_VINCULOS_JSON` com email, competencia e arquivo_id de cada nova cópia. Executar `executarVinculosPiloto`. O procedimento resolve o ID do funcionário, registra a associação e republica o índice; não é uma tela de upload. O formato completo dos dois JSONs está em `docs/etapas/ETAPA_05.md`.

Em resultado PARCIAL, preservar recursos e propriedades `PILOTO_OP_*`, corrigir a causa e repetir o mesmo pedido com a mesma conta. Não apagar recursos nem gerar novos IDs para contornar uma falha incerta. Os helpers são para piloto, com até 20 pedidos por lista e JSON de até 9000 bytes.

### Bloco 3 - Atualizar o portal e renovar índices

Somente depois de preparar cadastros e índices, atualizar o projeto funcionário com os arquivos atuais de `colaborador/`. Configurar o mesmo `INDICES_DRIVE_ID` e conferir o serviço Drive v3. Atualizar as duas implantações por nova versão, mantendo execução como usuário que acessa e restrição à organização.

As propriedades antigas do portal passam a ser ignoradas e não são alternativa ao índice. Atualizar o portal antes de preparar os índices bloqueará temporariamente o acesso. Os testes devem usar as URLs `/exec` e perfis separados A/B/RH.

Para continuar o piloto após o vencimento, executar `renovarIndicesPiloto` no editor RH. A validade máxima é de 24 horas, com atualização do mesmo arquivo. Não há gatilho automático de renovação nesta etapa e não se deve ampliar a validade no código para evitar o teste de expiração.

### Testes Google ainda obrigatórios

| Grupo de teste | Resultado esperado |
|---|---|
| Origem e escrita | Somente RH/técnicos aprovados escrevem em toda a árvore |
| Planilha privada | A/B não abrem nem pelo link direto |
| Cadastro e repetição | UUIDs distintos; repetir não duplica recursos ou registros |
| Perfil e PDF | Cada conta vê seu perfil e abre/baixa o próprio documento |
| Isolamento A/B | Perfil, índice, pasta e PDF do outro permanecem inacessíveis |
| Índice falso ou inválido | Cópia fora da origem, expiração, inatividade e ambiguidade negam |
| Revogação | Permissões efetivas retiradas bloqueiam também links antigos |
| Implantação e OAuth | Execução como visitante e escopos próprios de cada projeto |

Registrar data, conta de teste, código seguro, resultado e evidência sem dados sensíveis. Testar índice com `ativo=false` não significa implementar a inativação completa. Editar apenas ativo na planilha não atualiza um índice já publicado, e a expiração não revoga o Drive.

### Aceite e próxima ação

Executar a matriz detalhada de `docs/etapas/ETAPA_05.md` e obter confirmação manual antes de concluir. Nenhum resultado real foi criado por esta entrega documental. A Etapa 06 continua dependente de conclusão e autorização explícita.

## Etapa 06 - Painel RH operacional

**Situação: NAO_INICIADA. Planejamento documental, sujeito a autorização.** Não há nesta entrega novos formulários, upload ou inativação. O painel existente continua demonstrativo.

### Objetivo e pré-requisitos

Transformar os procedimentos administrativos em fluxos operacionais simples, com autorização no servidor. Antes de começar, a Etapa 05 precisa estar aceita no Google e o usuário precisa autorizar o escopo. Devem ser definidos tamanho máximo de PDF, responsáveis, retenção e regras para correção e mudança de identidade.

O desenvolvimento deverá atuar principalmente em `rh/`, com eventuais ajustes documentados nos contratos do portal. Os arquivos definitivos e as decisões de implementação serão apresentados antes de programar. Ao iniciar a etapa, criar seu registro operacional usando `docs/etapas/MODELO_ETAPA.md`.

### Fluxos previstos para o RH

O cadastro pedirá nome, e-mail corporativo e setor. O servidor gerará o identificador automaticamente. Para distinguir homônimos, o RH selecionará nome e e-mail, sem copiar UUIDs ou IDs de pasta na rotina normal.

O envio de documento deverá selecionar pessoa, competência e PDF. O backend validará destinatário, formato, tamanho, duplicidade e permissões antes de concluir o registro e publicar o índice. Um segundo holerite ativo para a mesma competência não poderá substituir o primeiro silenciosamente.

A edição de nome/setor preservará o ID. Troca de e-mail será operação controlada de identidade e permissões. Reaproveitar um endereço para outra pessoa não deve entregar o histórico anterior. A regra de recontratação continua dependente de decisão do RH.

A correção de documento deverá exigir confirmação, retirar a exposição antiga e manter arquivo restrito conforme retenção aprovada. A inativação deverá bloquear o portal e revogar permissões efetivas do Drive, inclusive herdadas e diretas. Uma revogação incompleta precisa aparecer como pendência.

### Falhas parciais e acompanhamento

O RH deverá conseguir distinguir sucesso, falha e operação parcial, consultar auditoria e retomar sem duplicar cadastro, pasta ou PDF. Se a criação no Drive terminar mas a gravação seguinte falhar, o sistema precisa conservar a referência já criada e reconhecer o ponto de retomada.

Não presumir que o bloqueio de um projeto coordena edições manuais ou outros projetos. Escritas continuam centralizadas no RH. Uma futura renovação automatizada de índices deverá ter desenho, responsável e autorização definidos; ela não existe no piloto atual.

### Testes e critérios de aceite previstos

- RH aprovado executa cada fluxo; A/B e contas não aprovadas recebem negação em chamadas diretas.
- Cadastro simultâneo e repetição não duplicam ID, pessoa ou recurso.
- PDF inválido, excesso do limite aprovado e competência indevida são rejeitados no servidor.
- Mudança de e-mail preserva vínculo documental e retira acesso da identidade antiga.
- Correção restringe o documento antigo e mantém rastreabilidade sem exclusão indevida.
- Inativação bloqueia novas consultas e links antigos após revogação efetiva.
- Falhas intermediárias produzem pendências claras e retomadas verificáveis.

O aceite exigirá evidências locais e reais, confirmação manual e atualização dos documentos. Não há prazo ou resultado de teste atribuído a esta etapa planejada.

## Etapa 07 - Segurança e testes integrados

**Situação: NAO_INICIADA. Planejamento documental, sujeito a autorização.** O objetivo será verificar o sistema integrado após os fluxos RH estarem implementados e aceitos.

### Objetivo e preparação

Revisar o caminho completo: navegador, servidor, planilha, índice, arquivo e permissões. Testar cada componente separadamente ajuda, mas não comprova que a combinação protege os dados. A etapa precisa de ambiente de homologação, contas distintas, dados fictícios e critérios de evidência aprovados.

Os arquivos centrais serão `tests/CHECKLIST.md`, os testes locais, os manifestos, `docs/SEGURANCA.md` e o futuro registro da etapa. Não se deve declarar conformidade legal ou acessibilidade completa com base em verificações parciais.

### Frentes de verificação planejadas

Identidade e autorização: confirmar contas internas/externas, identidade indisponível, revogação com página aberta e tentativa de operação RH por usuário comum. Repetir com usuários que não sejam editores nem implantadores.

Dados e arquivos: testar parâmetros adulterados, índices falsos/vencidos/ambíguos, vínculos de outras pessoas e links diretos. Confirmar que os erros não revelam perfil, e-mail ou referência de terceiros. Rever concessões diretas e herdadas em toda a árvore confiável.

Integridade: testar concorrência, colisão de UUID simulada, repetição de operação, falha entre serviços e retomada. Verificar entradas que poderiam virar fórmula no Sheets e texto interpretado indevidamente como HTML na interface.

Uso e capacidade: medir tempos e volume representativo de 31 a 100 funcionários conforme a carga aprovada, validar celular, teclado e recursos assistivos definidos. Consultar quotas atuais e medir consumo; não prometer capacidade com base apenas em número de testes locais.

### Como registrar as evidências

Cada caso deverá registrar cenário, ambiente, versão implantada, conta fictícia, resultado esperado, observado e referência de evidência sanitizada. Separar simulação local, observação remota e relato manual. Uma pendência antiga só deve ser considerada resolvida com evidência posterior correspondente.

Quotas podem variar e mudar; os limites aplicáveis deverão ser conferidos na documentação oficial e no ambiente durante a execução da etapa. O guia não fixa números como garantia de disponibilidade.

### Critérios de aceite previstos

O relatório integrado deverá listar casos aprovados, falhas, riscos e responsáveis. Pendências críticas de identidade, autorização, isolamento ou revogação precisam ser resolvidas antes da publicação. Retenção, suporte e recuperação devem estar definidos com os responsáveis.

A próxima etapa só poderá começar após aceite dos testes e autorização explícita. A existência de 93 testes locais anteriores não significa que esta etapa esteja iniciada ou concluída.

## Etapa 08 - Google Sites, publicação e operação

**Situação: NAO_INICIADA. Planejamento documental, sujeito a autorização.** Nenhum site ou ambiente de produção foi publicado por esta documentação.

### Objetivo e pré-requisitos

Oferecer uma entrada institucional no Google Sites, conduzir o piloto final e preparar a operação. São necessários aceite dos testes integrados, aprovação interna de RH e responsáveis por segurança/privacidade e definição de suporte, retenção e recuperação.

O Sites é a porta de entrada. O aplicativo Apps Script continua autorizando as operações e o Drive continua protegendo os PDFs. A publicação de uma página não deve ampliar o acesso aos documentos.

### Planejamento da entrada no Sites

Escolher entre link para a implantação do portal e incorporação, verificando navegação, login, consentimento e uso no celular. O Apps Script admite incorporação em Sites, mas o conteúdo continua sujeito às permissões e pode exigir autorização do usuário. Essa escolha deverá ser testada no ambiente real antes de adotar a experiência final.

Usar a URL versionada da implantação aprovada, restrita à organização. Conferir o público do Sites e do aplicativo separadamente. O painel RH deve manter acesso administrativo independente e limitado às contas aprovadas.

### Preparação da operação

Definir responsáveis por cadastro, publicação dos documentos, renovação de índices, suporte e incidentes. Explicar ao funcionário como entrar com a conta correta, consultar competências e pedir ajuda sem enviar holerites ou dados salariais por canais inadequados.

Documentar backup de código, cadastro, PDFs e configurações privadas com responsáveis, acesso e periodicidade aprovados. Testar restauração em ambiente separado; revisar permissões antes de reabrir o acesso. Guardar backup não comprova que a recuperação funciona.

Definir procedimento de retorno à versão anterior e de interrupção do serviço quando houver falha relevante. Retornar o código não desfaz automaticamente alterações de dados ou permissões; esses recursos exigem plano específico.

### Critérios de aceite previstos

- Entrada pelo Sites funciona com conta comum em desktop e celular.
- A/B continuam isolados e funcionários não abrem o painel RH ou a planilha administrativa.
- Procedimento de atualização identifica a versão publicada e permite diagnóstico seguro.
- Suporte, renovação de índices, retenção e resposta a incidentes têm responsáveis.
- Restauração foi testada com revisão de permissões.
- Aprovação interna e autorização final de produção estão registradas.

Somente após esses critérios e as confirmações necessárias será possível registrar a conclusão. A publicação não encerra a manutenção: permissões, contas RH, quotas, backups e pendências exigirão acompanhamento.

## Continuidade, glossário e fontes

### Próxima ação vigente

A próxima ação do desenvolvimento é executar o roteiro Google da Etapa 05 com A/B/RH e registrar os resultados. Esta entrega cria documentação e PDFs; não altera código dos aplicativos, não configura recursos Google e não conclui testes pendentes.

Para atualizar o projeto, ler README, decisões, progresso e histórico; consultar o registro da etapa; explicar o escopo; executar somente o autorizado; testar e registrar evidências. Atualizar os PDFs quando a situação ou as instruções mudarem. A data de edição identifica a fotografia documental.

### Glossário prático

| Termo | Explicação |
|---|---|
| Backend | Código no servidor que aplica regras e autoriza operações |
| Frontend | Interface executada no navegador |
| OAuth/escopo | Consentimento e limites de operações solicitadas à conta |
| ACL/permissão | Regra que permite ler, editar ou administrar um recurso |
| UUID | Identificador completo gerado e conferido pelo servidor |
| Índice individual | JSON com perfil mínimo e referências de uma pessoa |
| Lock | Bloqueio para coordenar execuções concorrentes do mesmo script |
| Retomada | Continuação de pedido interrompido sem duplicar recursos |
| Homologação | Verificação e aceite no ambiente definido para validação |

### Fontes internas e precedência

Este guia usa README, `docs/DECISOES.md`, `docs/PROGRESSO.md`, `docs/HISTORICO.md`, `docs/PLANO_DE_ETAPAS.md`, arquitetura, requisitos, modelo de dados, segurança, checklist e registros das etapas 01 a 05. As decisões mais recentes e os fechamentos documentados explicam a evolução das propostas iniciais. Em caso de divergência futura, conferir a versão e atualizar este guia.

### Documentação oficial Google

Consultada em 16/10/2026. Os links são clicáveis nos PDFs. Configuração de execução e identidade foram conferidas nas páginas Web Apps e Session; permissões na referência Drive; limites na página de quotas. As regras específicas do portal são decisões deste projeto, não garantias do Google.

- Web Apps, implantação, execução e Google Sites: https://developers.google.com/apps-script/guides/web
- Session e disponibilidade da identidade: https://developers.google.com/apps-script/reference/base/session
- Quotas e limites sujeitos a mudanças: https://developers.google.com/apps-script/guides/services/quotas
- Compartilhamento de arquivos, pastas e Drives: https://developers.google.com/workspace/drive/api/guides/manage-sharing

### Geração dos PDFs

O script `scripts/gerar_documentacao_pdf.py` usa este Markdown como fonte editável e gera um PDF geral, oito PDFs individuais e um pacote ZIP em `output/pdf/`. Também copia somente os PDFs documentais para `docs/referencias/atualizada/`, para versionamento. O PDF inicial permanece preservado. A geração requer Python com ReportLab e pypdf; não faz parte da aplicação Apps Script.
