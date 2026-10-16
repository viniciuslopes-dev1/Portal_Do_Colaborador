const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const a = "teste.a@armazenamentoemnuvem.com",
  b = "teste.b@armazenamentoemnuvem.com";
const pa = "pasta_A_123456",
  pb = "pasta_B_123456",
  fa = "arquivo_A_123456",
  fb = "arquivo_B_123456";
function carregar() {
  const mapa = [
    {
      email: a,
      pasta_id: pa,
      documentos: [{ competencia: "2026-09", arquivo_id: fa }],
    },
    {
      email: b,
      pasta_id: pb,
      documentos: [{ competencia: "2026-09", arquivo_id: fb }],
    },
  ];
  const state = {
    email: a,
    allow: JSON.stringify([a, b]),
    mapa: JSON.stringify(mapa),
    calls: [],
    meta: {},
    deny: false,
  };
  const ctx = vm.createContext({
    Session: {
      getActiveUser: () => ({ getEmail: () => state.email }),
      getEffectiveUser: () => ({ getEmail: () => state.email }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) =>
          key === "PILOTO_DRIVE_MAPA" ? state.mapa : state.allow,
      }),
    },
    Drive: {
      Files: {
        get: (id, opts) => {
          state.calls.push({ id, opts });
          if (state.deny) throw Error("segredo privado");
          assert.equal(opts.supportsAllDrives, true);
          if (id === pa || id === pb)
            return {
              id,
              mimeType: "application/vnd.google-apps.folder",
              trashed: false,
              ...state.meta[id],
            };
          return {
            id,
            mimeType: "application/pdf",
            trashed: false,
            parents: [id === fa ? pa : pb],
            capabilities: { canDownload: true },
            webViewLink: "https://drive.google.com/file/d/" + id + "/view",
            webContentLink:
              "https://drive.google.com/uc?export=download&id=" + id,
            ...state.meta[id],
          };
        },
      },
    },
  });
  for (const file of ["Code.gs", "Drive.gs"])
    vm.runInContext(
      fs.readFileSync(path.join(root, "colaborador", file), "utf8"),
      ctx,
    );
  return { ctx, state, mapa };
}
test("lista somente próprios sem URL; links revalidam e ação correta", () => {
  const { ctx, state } = carregar();
  const r = ctx.listarHolerites();
  assert.equal(r.resultado, "SUCESSO");
  assert.equal(r.documentos.length, 1);
  assert.equal(r.documentos[0].arquivo_id, fa);
  assert.equal(r.documentos[0].url, undefined);
  assert.equal(JSON.stringify(r).includes(fb), false);
  assert.equal(
    ctx.obterLinkHolerite(fa, "VISUALIZAR").url,
    "https://drive.google.com/file/d/" + fa + "/view",
  );
  assert.equal(ctx.obterLinkHolerite(fa, "BAIXAR").codigo, "LINK_AUTORIZADO");
  assert.ok(state.calls.every((c) => !c.opts.fields.includes("name")));
});
test("A não consulta B nem ID arbitrário antes IO", () => {
  const { ctx, state } = carregar();
  for (const id of [fb, "id_arbitrario_123"])
    assert.equal(
      ctx.obterLinkHolerite(id, "VISUALIZAR").codigo,
      "DOCUMENTO_INDISPONIVEL",
    );
  assert.equal(state.calls.length, 0);
});
test("ação inválida e ID malformado antes IO", () => {
  const { ctx, state } = carregar();
  for (const args of [
    [fa, "DOWNLOAD"],
    [fa, null],
    ["../../x", "VISUALIZAR"],
    [{}, "BAIXAR"],
  ])
    assert.equal(ctx.obterLinkHolerite(...args).codigo, "SOLICITACAO_INVALIDA");
  assert.equal(state.calls.length, 0);
});
test("revogar allowlist bloqueia lista e link antes IO", () => {
  const { ctx, state } = carregar();
  state.allow = JSON.stringify([b]);
  assert.equal(ctx.listarHolerites().codigo, "ACESSO_NEGADO");
  assert.equal(ctx.obterLinkHolerite(fa, "BAIXAR").codigo, "ACESSO_NEGADO");
  assert.equal(state.calls.length, 0);
});
for (const [label, meta] of [
  ["parent diferente", { parents: [pb] }],
  ["parent ausente", { parents: [] }],
  ["MIME diferente", { mimeType: "text/plain" }],
  ["atalho", { mimeType: "application/vnd.google-apps.shortcut" }],
  ["lixeira", { trashed: true }],
  ["id diferente", { id: fb }],
])
  test("nega metadata " + label, () => {
    const { ctx, state } = carregar();
    state.meta[fa] = meta;
    assert.equal(ctx.listarHolerites().codigo, "DOCUMENTO_INDISPONIVEL");
    assert.equal(
      ctx.obterLinkHolerite(fa, "VISUALIZAR").codigo,
      "DOCUMENTO_INDISPONIVEL",
    );
  });
test("pasta incorreta ou lixeira nega", () => {
  const { ctx, state } = carregar();
  state.meta[pa] = { trashed: true };
  assert.equal(ctx.listarHolerites().codigo, "DOCUMENTO_INDISPONIVEL");
  assert.equal(state.calls.length, 1);
});
test("falha API fecha sem detalhes/lista parcial", () => {
  const { ctx, state, mapa } = carregar();
  mapa[0].documentos.push({
    competencia: "2026-08",
    arquivo_id: "arquivo_C_123456",
  });
  state.mapa = JSON.stringify(mapa);
  state.meta["arquivo_C_123456"] = { mimeType: "text/plain" };
  assert.equal(ctx.listarHolerites().documentos, undefined);
  state.deny = true;
  assert.equal(
    JSON.stringify(ctx.obterLinkHolerite(fa, "BAIXAR")).includes("segredo"),
    false,
  );
});
test("sem capacidade download permite visualizar mas nega baixar", () => {
  const { ctx, state } = carregar();
  state.meta[fa] = { capabilities: { canDownload: false } };
  assert.equal(ctx.obterLinkHolerite(fa, "BAIXAR").codigo, "LINK_INDISPONIVEL");
  assert.equal(
    ctx.obterLinkHolerite(fa, "VISUALIZAR").codigo,
    "LINK_AUTORIZADO",
  );
});
for (const link of [
  null,
  "http://drive.google.com/uc?id=" + fa,
  "https://drive.google.com.evil.com/uc?id=" + fa,
  "https://evil@drive.google.com/uc?id=" + fa,
  "https://drive.google.com:443/uc?id=" + fa,
  "https://drive.google.com/uc?id=" + fb,
  "https://drive.google.com/uc?id=" + fa + "&id=" + fb,
  "https://drive.google.com/uc?id=" + fa + "&redirect=https://evil.com",
])
  test("rejeita link inválido " + String(link), () => {
    const { ctx, state } = carregar();
    state.meta[fa] = { webContentLink: link };
    assert.equal(
      ctx.obterLinkHolerite(fa, "BAIXAR").codigo,
      "LINK_INDISPONIVEL",
    );
  });
test("aceita link API usercontent exato", () => {
  const { ctx, state } = carregar();
  state.meta[fa] = {
    webContentLink:
      "https://drive.usercontent.google.com/download?id=" +
      fa +
      "&export=download",
  };
  assert.equal(ctx.obterLinkHolerite(fa, "BAIXAR").codigo, "LINK_AUTORIZADO");
});
for (const [label, mutate] of [
  ["email duplicado", (m) => (m[1].email = a.toUpperCase())],
  ["pasta duplicada", (m) => (m[1].pasta_id = pa)],
  ["arquivo cruzado", (m) => (m[1].documentos[0].arquivo_id = fa)],
  ["competência inválida", (m) => (m[0].documentos[0].competencia = "2026-13")],
  ["membro inválido", (m) => m.push(null)],
  ["campo extra", (m) => (m[0].x = true)],
  ["pasta como arquivo", (m) => (m[0].documentos[0].arquivo_id = pb)],
])
  test("config inválida " + label, () => {
    const { ctx, state, mapa } = carregar();
    mutate(mapa);
    state.mapa = JSON.stringify(mapa);
    assert.equal(ctx.listarHolerites().codigo, "CONFIGURACAO_INVALIDA");
    assert.equal(state.calls.length, 0);
  });
for (const raw of ["{", "{}", '"string"', " ".repeat(9001)])
  test("mapa malformado/tamanho", () => {
    const { ctx, state } = carregar();
    state.mapa = raw;
    assert.equal(ctx.listarHolerites().codigo, "CONFIGURACAO_INVALIDA");
    assert.equal(state.calls.length, 0);
  });
test("ausência e sem perfil distinguem pendência sem terceiro", () => {
  const { ctx, state } = carregar();
  for (const raw of [null, "", "[]"]) {
    state.mapa = raw;
    const r = ctx.listarHolerites();
    assert.equal(r.codigo, "CONFIGURACAO_PENDENTE");
    assert.equal(JSON.stringify(r).includes(b), false);
  }
  assert.equal(state.calls.length, 0);
});
test("perfil configurado vazio é sucesso vazio", () => {
  const { ctx, state, mapa } = carregar();
  mapa[0].documentos = [];
  state.mapa = JSON.stringify(mapa);
  assert.equal(ctx.listarHolerites().documentos.length, 0);
});
test("superfície pública completa e serviço Drive v3 apenas colaborador", () => {
  const files = ["Code.gs", "Drive.gs"]
    .map((f) => fs.readFileSync(path.join(root, "colaborador", f), "utf8"))
    .join("\n");
  const publicas = [...files.matchAll(/^function (\w+)\(/gm)]
    .map((m) => m[1])
    .filter((n) => !n.endsWith("_"))
    .sort();
  assert.deepEqual(
    publicas,
    ["doGet", "listarHolerites", "obterLinkHolerite", "obterSessao"].sort(),
  );
  const m = JSON.parse(
    fs.readFileSync(path.join(root, "colaborador/appsscript.json"), "utf8"),
  );
  assert.deepEqual(m.dependencies.enabledAdvancedServices, [
    { userSymbol: "Drive", serviceId: "drive", version: "v3" },
  ]);
});
