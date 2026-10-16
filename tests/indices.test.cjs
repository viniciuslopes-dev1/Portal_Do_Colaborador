// Integração simulada do gate de sessão com publicação confiável. Sem Google real.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  carregar,
  email,
  outro,
  drive,
  pasta,
  indice,
  arquivo,
} = require("./helpers/portal.cjs");
test("sessão e perfil sanitizados, dados mínimos sem ID/índice", () => {
  const { ctx } = carregar();
  const s = ctx.obterSessao();
  assert.equal(s.resultado, "SUCESSO");
  assert.equal(s.email, email);
  assert.equal(s._indice, undefined);
  const p = ctx.obterPerfil();
  assert.equal(p.perfil.nome, "Pessoa de Teste");
  assert.equal(p.perfil.funcionario_id, undefined);
  assert.equal(p.perfil.documentos, undefined);
});
for (const mode of ["string", "blob", "object"])
  test("leitura media " + mode + " validada com mesmo schema", () => {
    const { ctx, state } = carregar();
    state.media = mode;
    assert.equal(ctx.obterPerfil().resultado, "SUCESSO");
  });
for (const [label, fn, code] of [
  ["vazia", (s) => (s.email = ""), "ACESSO_NEGADO"],
  ["externa", (s) => (s.email = s.efetivo = "a@example.com"), "ACESSO_NEGADO"],
  ["identidade efetiva diferente", (s) => (s.efetivo = outro), "ACESSO_NEGADO"],
  ["sem origem", (s) => (s.origem = null), "CONFIGURACAO_PENDENTE"],
  ["inativo", (s) => (s.payload.ativo = false), "INDICE_INATIVO"],
  [
    "vencido",
    (s) => {
      s.payload.emitido_em = new Date(Date.now() - 7200000).toISOString();
      s.payload.valido_ate = new Date(Date.now() - 3600000).toISOString();
    },
    "INDICE_EXPIRADO",
  ],
  [
    "TTL longo",
    (s) =>
      (s.payload.valido_ate = new Date(Date.now() + 90000000).toISOString()),
    "INDICE_INVALIDO",
  ],
  [
    "emissão futura",
    (s) => (s.payload.emitido_em = new Date(Date.now() + 120000).toISOString()),
    "INDICE_INVALIDO",
  ],
  [
    "UUID truncado",
    (s) => (s.payload.funcionario_id = "123"),
    "INDICE_INVALIDO",
  ],
  [
    "destinatário diferente",
    (s) => (s.payload.email = outro),
    "INDICE_AUSENTE",
  ],
  [
    "ID conteúdo não corresponde",
    (s) => (s.payload.indice_id = "outra_referencia_123"),
    "INDICE_INVALIDO",
  ],
  [
    "parent conteúdo não corresponde",
    (s) => (s.payload.pasta_id = "outra_pasta_12345"),
    "INDICE_INVALIDO",
  ],
  [
    "campo extra",
    (s) => (s.payload.segredo = "não permitido"),
    "INDICE_INVALIDO",
  ],
  [
    "competência duplicada",
    (s) =>
      s.payload.documentos.push({
        ...s.payload.documentos[0],
        id: "550e8400-e29b-41d4-a716-446655440002",
        arquivo_id: "outra_referencia_123",
      }),
    "INDICE_INVALIDO",
  ],
  ["JSON quebrado", (s) => (s.texto = "{"), "INDICE_INDISPONIVEL"],
  ["falha API", (s) => (s.falhaApi = true), "INDICE_INDISPONIVEL"],
  [
    "versão mudou durante leitura",
    (s) => (s.mudarVersao = true),
    "INDICE_INDISPONIVEL",
  ],
])
  test("nega " + label, () => {
    const { ctx, state } = carregar();
    fn(state);
    for (const result of [
      ctx.obterSessao(),
      ctx.obterPerfil(),
      ctx.listarHolerites(),
      ctx.obterLinkHolerite(arquivo, "VISUALIZAR"),
    ]) {
      assert.equal(result.codigo, code);
      assert.equal(result.url, undefined);
      assert.equal(result.perfil, undefined);
      assert.equal(JSON.stringify(result).includes("detalhe secreto"), false);
    }
    assert.match(ctx.doGet().html, /Acesso negado/);
  });
for (const [label, override] of [
  ["outro Drive", { driveId: "outro_drive_123456" }],
  ["editável", { capabilities: { canEdit: true } }],
  ["capacidade ausente", { capabilities: {} }],
  ["lixeira", { trashed: true }],
  ["atalho", { mimeType: "application/vnd.google-apps.shortcut" }],
  ["tamanho excessivo", { size: "65537" }],
  ["parent ausente", { parents: [] }],
])
  test("fonte inválida " + label, () => {
    const { ctx, state } = carregar();
    state.files[indice] = override;
    const result = ctx.obterPerfil();
    assert.equal(result.resultado, "ERRO");
    assert.equal(result.perfil, undefined);
  });
test("cópia em Meu Drive não é lida nem aceita", () => {
  const { ctx, state } = carregar();
  state.pages = () => ({
    files: [{ id: "copia_em_meu_drive", mimeType: "application/json" }],
  });
  assert.equal(ctx.obterPerfil().codigo, "INDICE_AUSENTE");
  assert.equal(state.calls.filter((c) => c.method === "get").length, 0);
});
test("varredura incompleta ou token repetido nega", () => {
  for (const incomplete of [true, false]) {
    const { ctx, state } = carregar();
    state.pages = () => ({
      files: [],
      incompleteSearch: incomplete,
      nextPageToken: "repetido",
    });
    assert.equal(ctx.obterPerfil().codigo, "INDICE_INDISPONIVEL");
  }
});
test("paginação até fim e duplicidade confiável negam", () => {
  const { ctx, state } = carregar();
  state.pages = (opts) =>
    opts.pageToken
      ? { files: [{ id: indice, driveId: drive }] }
      : { files: [], nextPageToken: "pagina2" };
  assert.equal(ctx.obterPerfil().resultado, "SUCESSO");
  state.pages = () => ({
    files: [
      { id: indice, driveId: drive },
      { id: indice, driveId: drive },
    ],
  });
  assert.equal(ctx.obterPerfil().codigo, "INDICE_INVALIDO");
});
test("perfil removido após sessão bem sucedida não reutiliza autorização", () => {
  const { ctx, state } = carregar();
  assert.equal(ctx.obterSessao().resultado, "SUCESSO");
  state.payload.ativo = false;
  assert.equal(ctx.listarHolerites().codigo, "INDICE_INATIVO");
  assert.equal(
    ctx.obterLinkHolerite(arquivo, "BAIXAR").codigo,
    "INDICE_INATIVO",
  );
});
test("não depende de leitura do pai privado da pasta", () => {
  const { ctx } = carregar();
  assert.equal(ctx.obterPerfil().resultado, "SUCESSO");
});

test("dois índices distintos válidos para mesma conta negam sem escolher o mais recente", () => {
  const { ctx, state } = carregar();
  const segundo = "indice_duplicado_123";
  state.payloads[segundo] = {
    ...state.payload,
    indice_id: segundo,
    revisao: 2,
  };
  state.pages = () => ({
    files: [
      { id: indice, driveId: drive },
      { id: segundo, driveId: drive },
    ],
  });
  assert.equal(ctx.obterPerfil().codigo, "INDICE_AMBIGUO");
  assert.equal(
    ctx.obterLinkHolerite(arquivo, "BAIXAR").codigo,
    "INDICE_AMBIGUO",
  );
});
