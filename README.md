# Portal do Colaborador

Portal corporativo para consulta de holerites, com aplicativo separado para RH. HTML, CSS e JavaScript no Google Apps Script, integrado ao Google Workspace, Drive, Sheets e Sites.

## Estado atual

- Etapa 01: preparação do piloto concluída conforme confirmação manual do usuário.
- Etapa 02: autenticação piloto concluída conforme confirmação dos testes manuais.
- Etapa 03: interface conferida e aceita pelo usuário.
- Etapa 04: consulta, visualização, download e isolamento dos PDFs fictícios confirmados pelo usuário; Etapa 05 implementada e aguardando testes no Google; etapas 06 a 08 não iniciadas.
- 93 testes locais simulados aprovados; não comprovam identidade, OAuth ou permissões reais no Google.

## Estrutura

```text
colaborador/             Aplicativo Apps Script do funcionário
rh/                      Aplicativo Apps Script administrativo
  Code.gs                Backend de autorização e templates
  Drive.gs / Indices.gs  Consulta e autorização individual (colaborador/)
  Dados.gs / Piloto.gs    Persistência privada e execução guiada (rh/)
  Index.html             Estrutura visual
  Styles.html            Estilos
  Scripts.html           Interações
  appsscript.json        Manifesto de cada aplicativo
docs/                   Requisitos, arquitetura, decisões e continuidade
  etapas/                Registro individual das etapas
  referencias/           Documentação inicial em PDF
tests/                  Testes locais e checklist integrado
scripts/                Ferramentas locais de prévia (não implantar no Google)
AGENTS.md                Regras de trabalho e segurança
```

Os dois aplicativos são projetos independentes. Copie somente os arquivos da pasta correspondente para cada projeto Google. O código não depende de Node.js para funcionar; Node é usado apenas para executar os testes locais.

## Implantação e testes

Para configuração inicial da autenticação, consulte a [Etapa 02](docs/etapas/ETAPA_02.md). Para copiar a interface, consulte a [Etapa 03](docs/etapas/ETAPA_03.md). Para conectar os PDFs fictícios, configurar o mapa privado, novo consentimento e validar isolamento A/B, siga a [Etapa 04](docs/etapas/ETAPA_04.md).

```sh
node --test tests/*.test.cjs
```

Nunca versionar propriedades privadas, credenciais, PDFs reais de funcionários ou dados pessoais de produção. O portal agora exige cadastro ativo e índice individual válido; as propriedades temporárias da Etapa 04 não autorizam mais o acesso.

Para configurar a planilha privada, cadastrar A/B e publicar índices, siga a [Etapa 05](docs/etapas/ETAPA_05.md). Execute primeiro a preparação RH; atualizar o portal antes dos índices prontos impedirá temporariamente o acesso.

## Documentação

- [Progresso](docs/PROGRESSO.md), [histórico](docs/HISTORICO.md) e [decisões](docs/DECISOES.md).
- [Requisitos](docs/REQUISITOS.md), [arquitetura](docs/ARQUITETURA.md), [fluxos](docs/LOGICA_DO_SISTEMA.md) e [modelo de dados](docs/MODELO_DE_DADOS.md).
- [Segurança](docs/SEGURANCA.md), [configuração](docs/CONFIGURACAO.md) e [checklist](tests/CHECKLIST.md).
- [Plano de etapas](docs/PLANO_DE_ETAPAS.md), [Etapa 01](docs/etapas/ETAPA_01.md), [Etapa 02](docs/etapas/ETAPA_02.md), [Etapa 03](docs/etapas/ETAPA_03.md) e [Etapa 04](docs/etapas/ETAPA_04.md).
- [Especificação técnica](docs/DOCUMENTACAO_TECNICA_E_FUNCIONAL.md) e [documentação inicial PDF](docs/referencias/Portal_do_Colaborador_Documentacao_Novo_Projeto.pdf).
- [Referência visual](docs/design.md): somente apresentação do frontend; não define campos ou autenticação.
- [Pedido inicial arquivado](docs/INICIAR_PROJETO.md): referência de abertura do projeto, não representa o estado atual.

## Versionamento

Repositório: https://github.com/viniciuslopes-dev1/Portal_Do_Colaborador

Criar commits por conjunto coerente de alterações verificadas e publicar o progresso autorizado. Documentar o que está implementado, testado localmente e confirmado no Google. Evitar alterações de etapas futuras sem autorização.

## Prévia local da interface

```sh
node scripts/preview.cjs
```

Abrir http://127.0.0.1:4173/colaborador ou http://127.0.0.1:4173/rh. Identidade e sessão são simuladas somente nesta prévia; não comprovam OAuth ou autorização Google. Nunca copiar scripts/ para Apps Script. Na prévia, documentos e sessão são simulados e não há PDF real. No Google, o portal usa índices individuais da Etapa 05; a tela RH continua demonstrativa. Ações locais de PDF ficam indisponíveis por padrão.
