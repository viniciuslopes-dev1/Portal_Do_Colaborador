const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  carregar,
  drive,
  pasta,
  indice,
  arquivo,
} = require("./helpers/portal.cjs");
test("lista própria sem URLs, com data publicada e links distintos", () => {
  const { ctx, state } = carregar();
  const lista = ctx.listarHolerites();
  assert.equal(lista.resultado, "SUCESSO");
  assert.equal(lista.documentos[0].arquivo_id, arquivo);
  assert.equal(
    lista.documentos[0].data_disponibilizacao,
    state.payload.documentos[0].data_upload,
  );
  assert.equal(lista.documentos[0].url, undefined);
  assert.match(ctx.obterLinkHolerite(arquivo, "VISUALIZAR").url, /\/view/);
  assert.match(ctx.obterLinkHolerite(arquivo, "BAIXAR").url, /\/download/);
});
test("arquivo não publicado não é consultado no Drive", () => {
  const { ctx, state } = carregar();
  const id = "arquivo_de_outra_pessoa";
  assert.equal(
    ctx.obterLinkHolerite(id, "VISUALIZAR").codigo,
    "DOCUMENTO_INDISPONIVEL",
  );
  assert.equal(
    state.calls.some((c) => c.id === id),
    false,
  );
});
for (const [label, meta] of [
  ["pasta diferente", { parents: ["pasta_outro_123456"] }],
  ["MIME errado", { mimeType: "text/plain" }],
  ["arquivo lixeira", { trashed: true }],
  ["fora origem", { driveId: "drive_outro_12345" }],
  ["editável", { capabilities: { canEdit: true, canDownload: true } }],
])
  test("nega PDF " + label, () => {
    const { ctx, state } = carregar();
    state.files[arquivo] = meta;
    assert.equal(ctx.listarHolerites().codigo, "DOCUMENTO_INDISPONIVEL");
    assert.equal(
      ctx.obterLinkHolerite(arquivo, "VISUALIZAR").codigo,
      "DOCUMENTO_INDISPONIVEL",
    );
  });
test("pasta editável ou em outro Drive nega perfil", () => {
  const { ctx, state } = carregar();
  state.files[pasta] = { driveId: "drive_falso_123456" };
  assert.equal(ctx.obterPerfil().resultado, "ERRO");
});
test("download bloqueado respeitado sem bloquear visualização", () => {
  const { ctx, state } = carregar();
  state.files[arquivo] = {
    capabilities: { canEdit: false, canDownload: false },
  };
  assert.equal(
    ctx.obterLinkHolerite(arquivo, "BAIXAR").codigo,
    "LINK_INDISPONIVEL",
  );
  assert.equal(
    ctx.obterLinkHolerite(arquivo, "VISUALIZAR").codigo,
    "LINK_AUTORIZADO",
  );
});
for (const url of [
  null,
  "http://drive.google.com/uc?id=" + arquivo,
  "https://drive.google.com.evil.invalid/uc?id=" + arquivo,
  "https://drive.google.com/uc?id=arquivo_diferente",
  "https://drive.google.com/uc?id=" + arquivo + "&id=arquivo_diferente",
  "https://drive.google.com/uc?id=" +
    arquivo +
    "&redirect=https://example.invalid",
])
  test("link adulterado rejeitado " + url, () => {
    const { ctx, state } = carregar();
    state.files[arquivo] = { webContentLink: url };
    assert.equal(
      ctx.obterLinkHolerite(arquivo, "BAIXAR").codigo,
      "LINK_INDISPONIVEL",
    );
  });
test("ação inválida não obtém PDF", () => {
  const { ctx, state } = carregar();
  assert.equal(
    ctx.obterLinkHolerite(arquivo, "QUALQUER").codigo,
    "SOLICITACAO_INVALIDA",
  );
  assert.equal(
    state.calls.some((c) => c.id === arquivo),
    false,
  );
});
test("sem documentos continua perfil válido com lista vazia", () => {
  const { ctx, state } = carregar();
  state.payload.documentos = [];
  assert.equal(ctx.listarHolerites().documentos.length, 0);
});
