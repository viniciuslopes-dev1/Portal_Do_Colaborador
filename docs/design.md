# Design UI/UX — Portal do colaborador e painel administrativo

Versão: 1.0 · Idioma: português do Brasil · Plataforma prioritária: computador

## 1. Objetivo e referência

Reproduzir o estilo das telas aprovadas nesta conversa: um portal corporativo claro, sóbrio e organizado por tipografia, alinhamento, espaço em branco e divisórias delicadas. A tarefa principal do funcionário é consultar e baixar seu holerite. As tarefas principais do RH são cadastrar funcionários e conferir e publicar documentos.

Este arquivo é a especificação de implementação. As imagens são referências de composição; os valores abaixo padronizam o estilo para código e não representam medições exatas dos pixels gerados. Nomes, quantidades e documentos dos exemplos são fictícios.

## 2. Regras visuais obrigatórias

- Fundo principal branco e superfície contínua.
- Barra lateral cinza muito claro; conteúdo separado por uma linha vertical discreta.
- Azul-marinho quase preto como única cor de marca: `#101B2D`.
- Organização em seções abertas e tabelas, sem cards ou blocos flutuantes.
- Sem sombras, efeitos de vidro, gradientes de fundo ou ilustrações decorativas.
- Divisórias horizontais finas, com pontas afinadas e desvanecimento suave.
- Botões e campos com cantos discretos; não usar formato de cápsula.
- Ícones de contorno consistentes e ações importantes acompanhadas de texto.
- Dados, ações e títulos alinhados em uma grade comum.
- Preservar a clareza mesmo com nomes longos, erros e listas extensas.

Bordas são permitidas para controles: campos, seletores, botões secundários e área de envio de arquivos. Elas não devem transformar seções de conteúdo em cards. Avatares permanecem circulares.

## 3. Tokens de cor

| Token | Valor | Uso |
| --- | --- | --- |
| `--canvas` | `#FFFFFF` | Fundo do conteúdo |
| `--sidebar` | `#F5F7F8` | Fundo lateral |
| `--brand` | `#101B2D` | Ações, seleção, ícones de destaque |
| `--brand-hover` | `#1C2D47` | Hover do botão principal |
| `--text` | `#111827` | Títulos e conteúdo principal |
| `--text-secondary` | `#526075` | Descrições, rótulos e metadados |
| `--text-muted` | `#637084` | Informações de menor prioridade |
| `--line` | `#DCE3EA` | Divisórias decorativas |
| `--control-border` | `#7D8999` | Limites necessários para identificar campos |
| `--selected` | `#E9EEF2` | Item ativo na navegação |
| `--row-hover` | `#F7F9FB` | Realce leve de linha interativa |
| `--disabled-bg` | `#EDF0F3` | Controle indisponível |
| `--disabled-text` | `#697586` | Texto indisponível |
| `--error` | `#B42318` | Erro de validação ou ação destrutiva |

O verde das primeiras propostas foi substituído pelo azul-marinho. A pequena presença de verde/amarelo nos pontos de status de uma imagem do cadastro não define uma segunda paleta: a versão normativa usa texto, símbolos e azul/cinza. Reservar cores semânticas adicionais para situações que realmente precisem delas, sempre com rótulo explícito.

Divisórias podem ser claras porque são decorativas. Bordas necessárias para reconhecer controles precisam de contraste suficiente. Não clarear textos para simular sofisticação.

## 4. Tipografia

Fonte preferencial: **Inter**. Alternativas: `system-ui`, `-apple-system`, `Segoe UI`, `sans-serif`.

| Elemento | Tamanho / entrelinha | Peso |
| --- | --- | --- |
| Título da página | 36 / 44 px | 700 |
| Título de seção | 26 / 34 px | 650–700 |
| Mês do último holerite | 30 / 38 px | 700 |
| Número de resumo do RH | 36 / 44 px | 700 |
| Nome em destaque | 20 / 28 px | 600 |
| Texto principal e botões | 16 / 24 px | 400 / 600 |
| Tabela, labels e navegação | 14 / 20 px | 400–600 |
| Texto auxiliar | 13 / 20 px | 400 |
| Sobretítulo curto | 12 / 18 px | 600 |

Usar caixa normal em textos e títulos. Caixa alta apenas em pequenos identificadores, como “FOLHA MENSAL”, com `letter-spacing: .06em`. Valores numéricos e datas podem usar `font-variant-numeric: tabular-nums`. Não usar letras excessivamente finas.

## 5. Grade, dimensões e espaçamento

Referência de implementação: viewport de 1440 × 900 px, com rolagem vertical quando necessária. O enquadramento completo das imagens não é requisito para encaixar artificialmente toda tela em uma altura fixa.

| Elemento | Medida padrão |
| --- | --- |
| Barra lateral desktop | 240 px |
| Barra superior | 64 px |
| Padding principal desktop | 32 px |
| Distância entre seções | 32 px |
| Distância entre título e descrição | 8 px |
| Distância entre label e campo | 8 px |
| Espaço entre campos em linha | 24 px |
| Altura de botão e campo | 44 px |
| Altura mínima de item lateral | 48 px |
| Linha simples de tabela | mínimo 52 px |
| Linha com nome e e-mail | mínimo 64 px |
| Avatar do funcionário | 64 px |
| Avatar superior | 36 px |
| Ícones de navegação | 22–24 px |
| Ícones em ações | 18–20 px |
| Raio de controles | 4 px |

Escala de espaçamento: `4, 8, 12, 16, 24, 32, 40, 48, 64px`. Usar espaçamento interno consistente e altura flexível quando o texto quebrar. Em monitores muito largos, limitar a largura útil do conteúdo a aproximadamente 1520 px e preservar margens.

## 6. Estrutura compartilhada

### Barra lateral

Marca no topo, descrição do ambiente abaixo e navegação visível. Funcionário: “Portal do colaborador”. RH: “Painel administrativo”. Item ativo com fundo cinza azulado muito leve, texto em semibold e traço vertical de 3 px em azul-marinho. Ícone e texto separados por 12 px.

“Ajuda” e “Sair” ficam ao final, separados por uma divisória. Permitir rolagem quando a altura disponível for pequena; não sobrepor essas ações ao menu.

### Barra superior

Breadcrumb à esquerda; notificações e avatar à direita. Linha inferior simples. Sem campo de pesquisa global se não houver uma necessidade real. Mostrar somente navegações que existam.

### Cabeçalho da página

Um título principal, uma descrição curta e, quando necessário, um controle contextual à direita. Não repetir instruções longas ou adicionar frases promocionais. Na visão geral do funcionário, preferir “Suas informações e documentos em um só lugar.”

## 7. Divisórias com pontas afinadas

O centro mantém uma linha de 1 px. Nos últimos 32 px de cada extremidade, a forma afina e a opacidade desaparece suavemente. O efeito deve ser discreto, simétrico e sem sombra. Uma linha com gradiente apenas de opacidade não afina geometricamente; combinar forma e transparência quando possível.

```css
.divider {
  height: 1px;
  width: 100%;
  border: 0;
  background: linear-gradient(
    to right,
    transparent 0,
    var(--line) 32px,
    var(--line) calc(100% - 32px),
    transparent 100%
  );
  clip-path: polygon(
    0 50%, 32px 0, calc(100% - 32px) 0,
    100% 50%, calc(100% - 32px) 100%, 32px 100%
  );
}
```

Usar em transições de seção e separação de linhas da tabela. Na tabela, implementar com uma camada decorativa de fundo ou pseudoelemento, sem alterar a estrutura semântica. A separação entre linhas também depende do espaçamento. Não aplicar desvanecimento em bordas de campos ou indicadores de foco. Separadores verticais entre metadados podem ser retos e muito discretos.

## 8. Componentes e estados

### Botões e links

Principal: fundo azul-marinho sólido e texto branco; altura de 44 px, padding horizontal de 20 px, peso 600. Um principal por grupo de tarefa. Hover com mudança discreta de fundo; sem elevação ou escala. Secundário: contorno ou texto azul-marinho, mantendo área clicável confortável.

Usar rótulos específicos: “Baixar PDF”, “Cadastrar funcionário”, “Publicar 2 holerites”. Na tabela, “Visualizar” e “Baixar PDF” aparecem escritos, com seus ícones. Links têm indicação no hover e no foco; não depender de tooltip para explicar a ação.

Estados obrigatórios: padrão, hover, foco, pressionado, carregando e indisponível. Ao processar, preservar largura e mudar o rótulo: “Cadastrando…” ou “Publicando…”. Impedir envios duplicados. Não apresentar sucesso antes da confirmação do sistema.

### Campos

Label persistente acima do controle. Placeholder é um exemplo, nunca o único rótulo. Campos obrigatórios recebem asterisco e explicação “* Campos obrigatórios”. Bordas finas, fundo branco, texto alinhado à esquerda. Não usar formulários com labels flutuantes.

Mensagem de erro abaixo do campo, indicando a correção: “Informe um e-mail válido”. Preservar os dados preenchidos após erro. Ao salvar, mostrar confirmação próxima à tarefa sem retirar o acesso à lista.

### Tabelas

Sem borda externa, zebra permanente, células encapsuladas ou cantos arredondados no conjunto. Cabeçalho discreto, linhas horizontais delicadas e alinhamento consistente. Datas em `DD/MM/AAAA`; mês de referência por extenso. Cabeçalho da última coluna: “Ações”.

Não esconder nomes, matrícula ou ações essenciais para encaixar a tabela. Permitir quebra de nome e e-mail; tooltip somente como complemento. Filtro e busca acima da lista; paginação abaixo. Manter filtros durante edição e retorno. Não limitar a lista real a três registros porque o mockup mostra três exemplos.

### Status e notificações

Status em texto com símbolo pequeno: “Ativo”, “Convite pendente”, “Pronto para publicar”, “Vínculo pendente”. Evitar cápsulas grandes e fundos coloridos. Informações nunca dependem apenas da cor.

Feedback curto e contextual. Erro permanece até ser resolvido ou dispensado. Carregamento anuncia a atividade e oferece recuperação em caso de falha. Avisos persistentes relacionados ao envio ficam na própria seção, sem virar cards.

### Envio de arquivos

Área de arrastar arquivos ampla, rasa, com borda tracejada discreta, ícone e botão “Selecionar PDFs”. Oferecer seleção por botão e teclado; arrastar não é o único caminho. Mostrar progresso por arquivo e permitir remover antes da publicação. Indicar formato aceito e limites definidos pelo produto. Nunca inventar um limite no texto sem implementá-lo.

## 9. Tela do funcionário — visão geral

Ordem dos elementos:

1. Saudação “Olá, Vinícius” e descrição curta.
2. Faixa compacta de identificação: foto, nome, cargo, situação, matrícula, departamento e admissão.
3. Divisória.
4. “Seu último holerite”: tipo, mês em destaque, data de disponibilização e ações “Baixar PDF” / “Visualizar”.
5. “Holerites anteriores”: filtro por ano e tabela.
6. Link “Ver histórico completo”.
7. Ajuda contextual com “Falar com o RH”.
8. Rodapé discreto de confidencialidade.

Tabela: “Mês de referência”, “Tipo”, “Disponível desde”, “Ações”. Ordenar do mais recente para o mais antigo. Na visão geral, não repetir o documento destacado na lista anterior. No histórico completo, listar todos os documentos, inclusive o mais recente. O ano selecionado deve corresponder ao histórico exibido.

Não apresentar salário líquido ou bruto na visão geral. O funcionário consulta os valores no documento. “Visualizar” abre um visualizador identificado pelo mês, com opção de baixar e retorno claro à origem. Não considerar a mera visualização como aceite ou assinatura.

## 10. RH — tela principal

Menu: “Visão geral”, “Funcionários”, “Holerites”.

1. Título “Visão geral”, descrição e período selecionado.
2. Resumo em três colunas abertas: funcionários ativos, holerites publicados e aguardando publicação.
3. Ações rápidas em linhas: cadastrar funcionário e enviar holerites.
4. Tabela de pendências: funcionário, matrícula, departamento e situação.
5. Atividade recente em lista textual.

Os números não recebem caixas. Separadores verticais discretos são suficientes. Contagens de publicação devem explicitar a competência e considerar apenas quem tem folha esperada naquele período; não presumir que o total atual de ativos é o denominador correto. Rascunhos não contam como publicados.

## 11. RH — cadastro e lista de funcionários

Formulário aberto no topo, lista abaixo. Grade de duas colunas: nome completo / e-mail de acesso; matrícula / departamento; cargo / data de admissão. Nome, e-mail, matrícula, departamento e admissão são obrigatórios nesta especificação.

Checkbox “Enviar convite de acesso por e-mail”; explicação “O funcionário definirá a própria senha pelo convite”. Ação principal “Cadastrar funcionário”. Se oferecer “Limpar”, deixá-la visualmente secundária e evitar perda acidental de dados preenchidos.

Na lista: busca por nome, matrícula ou e-mail; filtros de departamento e acesso. Colunas: funcionário com e-mail em segunda linha, matrícula, departamento, acesso e ações. Ações: “Editar” e, para convites pendentes, “Reenviar convite”. Cadastro não é prova de ativação: distinguir “Convite pendente”, “Ativo” e “Inativo”.

Validar duplicidade de matrícula e e-mail. Separar mensagem “Funcionário cadastrado” da confirmação de entrega ou falha do convite. Edição mantém a posição e os filtros da lista. Não usar exclusão imediata como operação cotidiana; inativação deve ser uma ação explícita e identificada.

## 12. RH — envio, conferência e publicação de holerites

Fluxo em três etapas: “Enviar arquivos”, “Conferir vínculos”, “Publicar”. Indicador textual discreto, sem cards numerados.

1. Selecionar mês de referência e tipo de folha.
2. Enviar um PDF por funcionário, individualmente ou em lote.
3. Listar arquivo, funcionário vinculado, situação e ações.
4. Conferir nome e matrícula; permitir corrigir o vínculo.
5. Revisar o resumo da publicação e confirmar os documentos prontos.
6. Mostrar resultado com quantidade publicada e pendências preservadas.

Nome de arquivo pode sugerir um vínculo, mas não deve ser a única prova para publicação automática. A regra de identificação depende da integração e da validação do produto. Documento sem vínculo, com conflito de competência ou duplicidade fica pendente.

Publicação parcial é permitida apenas com clareza: “Publicar 2 holerites” e aviso de que o arquivo pendente ficará em rascunho. Antes da confirmação final, apresentar quantidade, período, destinatários e eventual substituição. Cada funcionário vê somente seu documento. Não associar envio de PDF à disponibilização imediata.

Ação “Remover” antes da publicação retira o arquivo do lote. Depois de publicado, correção ou substituição precisa de fluxo explícito, histórico e confirmação. O checkbox de notificação respeita sua seleção; falha na notificação não desfaz nem oculta uma publicação já concluída.

## 13. Estados que precisam ser desenhados

| Situação | Apresentação e próximo passo |
| --- | --- |
| Funcionário sem holerites | “Você ainda não tem holerites disponíveis.” + acesso ao RH |
| Filtro sem resultado | “Nenhum documento neste período.” + trocar filtro |
| Lista de funcionários vazia | Descrição breve + “Cadastrar funcionário” |
| Falha no download | Mensagem contextual + “Tentar novamente” |
| PDF inválido | Nome do arquivo + motivo + substituir/remover |
| Vínculo não encontrado | Seleção explícita do funcionário; publicação impedida para esse arquivo |
| Documento duplicado | Identificar documento existente e exigir decisão explícita |
| Salvamento em andamento | Indicador e rótulo na ação; impedir envio repetido |
| Falha ao carregar lista | Mensagem + tentar novamente, preservando filtros |
| Alterações não salvas | Avisar ao sair se houver perda real de trabalho |

## 14. Acessibilidade e comportamento responsivo

Usar HTML semântico: landmarks, um `h1`, títulos hierárquicos, labels associados, tabela real com cabeçalhos e botões reais. Foco visível de 2 px em azul-marinho com afastamento de 3 px; não remover outline sem substituição. Indicar página ativa semanticamente. Mensagens de processamento e resultado devem ser anunciadas a leitores de tela sem mover o foco desnecessariamente.

Meta: atender WCAG 2.2 nível AA. Verificar contraste de texto comum de pelo menos 4,5:1, texto grande de 3:1 e identificação visual necessária de controles/estados de 3:1, conforme critérios e exceções. Preferir área interativa de 44 × 44 px; considerar o mínimo AA de 24 × 24 px e suas exceções. Nenhuma imagem gerada comprova conformidade.

Desktop é prioritário. Abaixo de 1200 px, reduzir padding para 24 px e permitir reorganização dos metadados. Abaixo de 900 px, formulário passa a uma coluna e ações podem quebrar linha. Abaixo de 768 px, navegação lateral vira painel acessível acionado por botão com texto “Menu”. Tabelas mantêm estrutura em região com rolagem horizontal identificada, sem converter linhas em cards. Não ocultar ações essenciais.

Suportar zoom de 200%, navegação por teclado, nomes extensos e preferência por movimento reduzido. Transições de cor/foco entre 120 e 160 ms; sem animação de entrada decorativa. Erros e decisões importantes não devem depender de mensagens que desapareçam sozinhas.

## 15. Base CSS

```css
:root {
  --canvas: #fff;
  --sidebar: #f5f7f8;
  --brand: #101b2d;
  --brand-hover: #1c2d47;
  --text: #111827;
  --text-secondary: #526075;
  --text-muted: #637084;
  --line: #dce3ea;
  --control-border: #7d8999;
  --selected: #e9eef2;
  --row-hover: #f7f9fb;
  --disabled-bg: #edf0f3;
  --disabled-text: #697586;
  --error: #b42318;
  --sidebar-width: 240px;
  --topbar-height: 64px;
  --control-radius: 4px;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text);
  background: var(--canvas);
}
button, input, select { font: inherit; }
.app {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100dvh;
}
.sidebar { background: var(--sidebar); border-right: 1px solid var(--line); }
.main { min-width: 0; }
.page { padding: 32px; max-width: 1584px; margin-inline: auto; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.control { min-height: 44px; border: 1px solid var(--control-border); border-radius: 4px; background: #fff; padding: 10px 12px; color: var(--text); }
.button-primary { min-height: 44px; padding: 10px 20px; border: 1px solid var(--brand); border-radius: 4px; background: var(--brand); color: #fff; font-weight: 600; }
.button-primary:hover { background: var(--brand-hover); }
:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 14px 12px; vertical-align: middle; }
th { color: var(--text-secondary); font-weight: 500; }
@media (max-width: 1199px) { .page { padding: 24px; } }
@media (max-width: 899px) { .form-grid { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 767px) {
  .app { grid-template-columns: minmax(0, 1fr); }
  .page { padding: 20px 16px; }
  /* Implementar a sidebar como painel acessível controlado pelo botão Menu. */
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

O trecho é uma fundação de estilo, não uma aplicação completa. Complementar os componentes com estados, regras responsivas e semântica descritos neste documento.

## 16. Critérios de aceite visual e funcional

- [ ] Superfície principal contínua; nenhuma seção transformada em card.
- [ ] Azul-marinho quase preto aplicado consistentemente.
- [ ] Linhas delicadas com pontas suaves, sem reduzir contraste de controles.
- [ ] Navegação e hierarquia correspondem à página exibida.
- [ ] Holerite recente visível cedo e ações escritas claramente.
- [ ] Histórico ordenado e sem duplicação do destaque na visão geral.
- [ ] Cadastro e lista coexistem com busca, filtros e paginação.
- [ ] Convite, ativação e cadastro têm estados distintos.
- [ ] RH confere funcionário e competência antes de publicar.
- [ ] Pendências e duplicidades não são publicadas silenciosamente.
- [ ] Feedback de carregamento, erro, vazio e sucesso implementado.
- [ ] Teclado, foco, contraste, zoom e leitor de tela verificados.
- [ ] Telas verificadas em 1440 × 900 e 1920 × 1080, sem forçar altura fixa.
- [ ] Testes com funcionários: localizar e baixar um mês específico.
- [ ] Testes com RH: cadastrar pessoa, corrigir vínculo e publicar lote parcial.

## 17. Referências de fundamentação

As decisões específicas deste portal são propostas de design; não se deve interpretar as fontes como validação experimental desta interface.

- Nielsen Norman Group — [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): consistência, feedback, prevenção de erros e reconhecimento.
- Nielsen Norman Group — [Icon Usability](https://www.nngroup.com/articles/icon-usability/): rótulos visíveis para ações.
- Nielsen Norman Group — [Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/): priorização da informação necessária à tarefa.
- W3C — [WCAG 2.2](https://www.w3.org/TR/WCAG22/): critérios de acessibilidade para implementação e testes.

## 18. Instrução curta para implementação

> Implemente este portal seguindo o design.md: desktop claro, fundo branco contínuo, sidebar cinza muito claro, azul #101B2D, tipografia Inter, tabelas abertas e divisórias de 1 px com pontas afinadas e desvanecimento suave. Não criar cards, sombras, gradientes decorativos ou botões em cápsula. Usar ações com texto, controles de 44 px e estados acessíveis. Manter os mesmos componentes no portal do funcionário e no painel RH. Priorizar consulta de holerites, cadastro de funcionários e conferência antes da publicação.
