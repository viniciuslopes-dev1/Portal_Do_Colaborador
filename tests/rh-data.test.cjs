// Serviços simulados não comprovam OAuth, ACLs ou persistência no Google.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const rh = "rh.teste@armazenamentoemnuvem.com",
  email = "teste.a@armazenamentoemnuvem.com";
const uid = (n) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
const op = uid(900),
  op2 = uid(901),
  pdf = "pdf_existente_12345";
function ambiente() {
  const state = {
    email: rh,
    props: {
      PILOTO_RH_EMAILS: JSON.stringify([rh]),
      RH_PLANILHA_ID: "planilha_privada_123",
      RH_RAIZ_HOLERITES_ID: "raiz_holerites_123",
      INDICES_DRIVE_ID: "drive_confiavel_123",
    },
    abas: {},
    files: {},
    seq: 1,
    uuids: [],
    creates: 0,
    updates: 0,
    failCreate: false,
    failPermission: false,
    apiCalls: 0,
  };
  function sheet(nome) {
    const data = [];
    const s = {
      data,
      getLastRow: () => data.length,
      getLastColumn: () => Math.max(0, ...data.map((r) => r.length)),
      getRange: (r, c, n = 1, m = 1) => ({
        setNumberFormat() {
          return this;
        },
        setValues(vals) {
          for (let i = 0; i < n; i++) {
            if (!data[r - 1 + i]) data[r - 1 + i] = [];
            for (let j = 0; j < m; j++) data[r - 1 + i][c - 1 + j] = vals[i][j];
          }
          return this;
        },
        getValues: () =>
          Array.from({ length: n }, (_, i) =>
            Array.from(
              { length: m },
              (_, j) => data[r - 1 + i]?.[c - 1 + j] ?? "",
            ),
          ),
        getFormulas: () => Array.from({ length: n }, () => Array(m).fill("")),
      }),
    };
    state.abas[nome] = s;
    return s;
  }
  const base = { getSheetByName: (n) => state.abas[n], insertSheet: sheet };
  const privateAcl = () => [
    { id: "p_rh", type: "user", role: "organizer", emailAddress: rh },
  ];
  state.files[state.props.RH_PLANILHA_ID] = {
    id: state.props.RH_PLANILHA_ID,
    mimeType: "application/vnd.google-apps.spreadsheet",
    trashed: false,
    perms: privateAcl(),
  };
  state.files[state.props.RH_RAIZ_HOLERITES_ID] = {
    id: state.props.RH_RAIZ_HOLERITES_ID,
    mimeType: "application/vnd.google-apps.folder",
    trashed: false,
    driveId: state.props.INDICES_DRIVE_ID,
    perms: privateAcl(),
  };
  const ctx = vm.createContext({
    Date,
    Session: {
      getActiveUser: () => ({ getEmail: () => state.email }),
      getEffectiveUser: () => ({ getEmail: () => state.email }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => state.props[k] ?? null,
      }),
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        hasLock: () => true,
        releaseLock() {},
      }),
    },
    SpreadsheetApp: { openById: () => base, flush() {} },
    Utilities: {
      getUuid: () =>
        state.uuids.length ? state.uuids.shift() : uid(state.seq++),
      DigestAlgorithm: { SHA_256: "sha256" },
      computeDigest: (_, s) =>
        Array.from(crypto.createHash("sha256").update(s).digest()),
      newBlob: (s) => ({ text: s }),
    },
    DriveApp: {
      getFileById: (id) => ({
        getBlob: () => ({ getDataAsString: () => state.files[id].content }),
      }),
    },
    Drive: {
      Files: {
        get: (id, opts) => {
          state.apiCalls++;
          assert.equal(opts.supportsAllDrives, true);
          if (!state.files[id]) throw Error("privado");
          return { ...state.files[id] };
        },
        list: (opts) => {
          const parent = opts.q.match(/^'([^']+)'/)[1],
            marker = opts.q.match(/value='([^']+)'/)?.[1];
          return {
            files: Object.values(state.files)
              .filter(
                (f) =>
                  f.parents?.includes(parent) &&
                  (!marker || f.appProperties?.portal_operacao === marker),
              )
              .map((f) => ({ id: f.id })),
          };
        },
        create: (body, media, opts) => {
          state.creates++;
          const id = "recurso_criado_" + state.creates;
          state.files[id] = {
            ...body,
            id,
            trashed: false,
            driveId: state.props.INDICES_DRIVE_ID,
            perms: privateAcl(),
            content: "",
          };
          if (state.failCreate) {
            state.failCreate = false;
            throw Error("resposta perdida");
          }
          return { id };
        },
        update: (body, id, blob) => {
          state.updates++;
          Object.assign(state.files[id], body, { content: blob.text });
          return { id };
        },
      },
      Permissions: {
        list: (id) => ({ permissions: state.files[id].perms }),
        create: (body, id) => {
          if (state.failPermission) throw Error("ACL negada");
          state.files[id].perms.push({ ...body, id: "p_leitor" });
          return { id: "p_leitor" };
        },
      },
    },
  });
  for (const file of ["Code.gs", "Dados.gs"])
    vm.runInContext(fs.readFileSync(path.join(root, "rh", file), "utf8"), ctx);
  return { ctx, state, base };
}
const dados = () => ({ nome: "Pessoa de teste", email, setor: "Teste" });
function cadastrar(env) {
  assert.equal(env.ctx.prepararBase().resultado, "SUCESSO");
  const r = env.ctx.cadastrarFuncionario(dados(), op);
  assert.equal(r.resultado, "SUCESSO", JSON.stringify(r));
  return r.funcionario_id;
}
function funcionario(state) {
  const d = state.abas.Funcionarios.data;
  return Object.fromEntries(d[0].map((k, i) => [k, d[1][i]]));
}
function addPdf(state, f) {
  state.files[pdf] = {
    id: pdf,
    name: "folha-teste.pdf",
    mimeType: "application/pdf",
    trashed: false,
    driveId: state.props.INDICES_DRIVE_ID,
    parents: [f.pasta_id],
    perms: [{ id: "prh", type: "user", role: "organizer", emailAddress: rh }],
  };
}
test("setup não apaga; cadastro UUID/index TTL24 e ACL reader; repetição mesma operação não duplica", () => {
  const e = ambiente();
  const id = cadastrar(e);
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.equal(e.ctx.prepararBase().resultado, "SUCESSO");
  const r = e.ctx.cadastrarFuncionario(dados(), op);
  assert.equal(r.funcionario_id, id);
  assert.equal(e.state.abas.Funcionarios.data.length, 2);
  assert.equal(e.state.creates, 2);
  const f = funcionario(e.state),
    i = JSON.parse(e.state.files[f.indice_id].content);
  assert.equal(i.funcionario_id, id);
  assert.equal(i.indice_id, f.indice_id);
  assert.equal(new Date(i.valido_ate) - new Date(i.emitido_em), 86400000);
  assert.equal(
    e.state.files[f.indice_id].perms.find((p) => p.emailAddress === email).role,
    "reader",
  );
});
test("colisão UUID servidor tenta outro sem duplicação", () => {
  const e = ambiente();
  const id = cadastrar(e);
  e.state.uuids = [id, uid(700), uid(701)];
  const r = e.ctx.cadastrarFuncionario(
    { ...dados(), email: "teste.b@armazenamentoemnuvem.com" },
    op2,
  );
  assert.equal(r.resultado, "SUCESSO");
  assert.equal(r.funcionario_id, uid(700));
});
test("op mesma ID dados diferentes rejeitada", () => {
  const e = ambiente();
  cadastrar(e);
  assert.equal(
    e.ctx.cadastrarFuncionario({ ...dados(), nome: "Outro" }, op).codigo,
    "OPERACAO_CONFLITANTE",
  );
});
test("email duplicado e fórmula rejeitados", () => {
  const e = ambiente();
  cadastrar(e);
  assert.equal(
    e.ctx.cadastrarFuncionario(dados(), op2).codigo,
    "CADASTRO_DUPLICADO_OU_LIMITE",
  );
  for (const nome of ["=IMPORTXML(1)", "+SUM(1)", "@teste", "-teste"])
    assert.equal(
      e.ctx.cadastrarFuncionario({ ...dados(), nome }, op2).codigo,
      "DADOS_INVALIDOS",
    );
});
test("resposta create perdida recupera pelo marcador sem recriar pasta", () => {
  const e = ambiente();
  e.ctx.prepararBase();
  e.state.failCreate = true;
  assert.equal(e.ctx.cadastrarFuncionario(dados(), op).resultado, "PARCIAL");
  const r = e.ctx.cadastrarFuncionario(dados(), op);
  assert.equal(r.resultado, "SUCESSO");
  assert.equal(e.state.creates, 2);
});
test("tentativa incerta sem recurso encontrado não cria cegamente", () => {
  const e = ambiente();
  e.ctx.prepararBase();
  e.state.failCreate = true;
  e.ctx.cadastrarFuncionario(dados(), op);
  delete e.state.files.recurso_criado_1;
  const r = e.ctx.cadastrarFuncionario(dados(), op);
  assert.equal(r.codigo, "CRIACAO_INDETERMINADA");
  assert.equal(e.state.creates, 1);
});
test("falha ACL permanece parcial e retomada conserva recursos", () => {
  const e = ambiente();
  e.ctx.prepararBase();
  e.state.failPermission = true;
  assert.equal(e.ctx.cadastrarFuncionario(dados(), op).resultado, "PARCIAL");
  assert.equal(e.state.updates, 0);
  e.state.failPermission = false;
  assert.equal(e.ctx.cadastrarFuncionario(dados(), op).resultado, "SUCESSO");
  assert.equal(e.state.creates, 2);
});
test("PDF existente registra uma vez e renova mesmo índice", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  addPdf(e.state, f);
  const req = { funcionario_id: id, competencia: "2026-10", arquivo_id: pdf };
  assert.equal(e.ctx.registrarHoleritePiloto(req, op2).resultado, "SUCESSO");
  assert.equal(e.ctx.registrarHoleritePiloto(req, op2).resultado, "SUCESSO");
  assert.equal(e.state.abas.Holerites.data.length, 2);
  assert.equal(e.state.creates, 2);
  const i = JSON.parse(e.state.files[f.indice_id].content);
  assert.equal(i.documentos.length, 1);
  assert.equal(i.documentos[0].arquivo_id, pdf);
  assert.equal(i.revisao, 2);
});
test("PDF órfão ou parent de outra pessoa falha sem inserir Holerites", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  addPdf(e.state, f);
  e.state.files[pdf].parents = ["outra_pasta_123"];
  assert.equal(
    e.ctx.registrarHoleritePiloto(
      { funcionario_id: id, competencia: "2026-10", arquivo_id: pdf },
      op2,
    ).resultado,
    "PARCIAL",
  );
  assert.equal(e.state.abas.Holerites.data.length, 1);
});
test("competência duplicada rejeitada sem sobrescrever", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  addPdf(e.state, f);
  const req = { funcionario_id: id, competencia: "2026-10", arquivo_id: pdf };
  e.ctx.registrarHoleritePiloto(req, op2);
  assert.equal(
    e.ctx.registrarHoleritePiloto(req, uid(902)).codigo,
    "COMPETENCIA_DUPLICADA",
  );
});
test("índice já com acesso alheio bloqueia antes de atualizar conteúdo", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  e.state.files[f.indice_id].perms.push({
    type: "user",
    role: "reader",
    emailAddress: "teste.b@armazenamentoemnuvem.com",
  });
  const count = e.state.updates;
  assert.equal(e.ctx.publicarIndice(id).codigo, "PERMISSAO_INDEVIDA");
  assert.equal(e.state.updates, count);
});
test("planilha com acesso amplo negada e header estranho preservado", () => {
  const e = ambiente();
  e.ctx.prepararBase();
  e.state.abas.Funcionarios.data[0][0] = "errado";
  assert.equal(e.ctx.prepararBase().codigo, "CABECALHO_INVALIDO");
  assert.equal(e.state.abas.Funcionarios.data[0][0], "errado");
  e.state.files[e.state.props.RH_PLANILHA_ID].perms.push({
    type: "domain",
    role: "reader",
  });
  assert.equal(e.ctx.prepararBase().codigo, "PLANILHA_NAO_PRIVADA");
});
test("todas APIs negam não RH antes de IO e sem detalhes privados", () => {
  const e = ambiente();
  e.state.email = email;
  for (const call of [
    () => e.ctx.prepararBase(),
    () => e.ctx.cadastrarFuncionario(dados(), op),
    () => e.ctx.publicarIndice(uid(1)),
    () => e.ctx.registrarHoleritePiloto({}, op),
  ]) {
    const r = call();
    assert.equal(r.codigo, "ACESSO_NEGADO");
    assert.equal(JSON.stringify(r).includes(email), false);
  }
  assert.equal(e.state.apiCalls, 0);
});
test("base adulterada holerite órfão nega publicação", () => {
  const e = ambiente();
  const id = cadastrar(e);
  e.state.abas.Holerites.data.push([
    uid(800),
    uid(799),
    "2026-10",
    pdf,
    "folha.pdf",
    new Date(),
    rh,
    "ATIVO",
    op2,
  ]);
  assert.equal(e.ctx.publicarIndice(id).codigo, "INTEGRIDADE_INVALIDA");
});
test("filho inesperado impede compartilhar e publicar dados novos", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  e.state.files.arquivo_estranho_123 = {
    id: "arquivo_estranho_123",
    parents: [f.pasta_id],
    trashed: false,
  };
  const count = e.state.updates;
  assert.equal(e.ctx.publicarIndice(id).codigo, "CONTEUDO_PASTA_INVALIDO");
  assert.equal(e.state.updates, count);
});
test("nome PDF com separador rejeitado antes registro", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  addPdf(e.state, f);
  e.state.files[pdf].name = "pasta/folha.pdf";
  assert.equal(
    e.ctx.registrarHoleritePiloto(
      { funcionario_id: id, competencia: "2026-10", arquivo_id: pdf },
      op2,
    ).codigo,
    "NOME_ARQUIVO_INVALIDO",
  );
  assert.equal(e.state.abas.Holerites.data.length, 1);
});
test("UUID de documento reservado parcial participa da detecção de colisão", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state);
  addPdf(e.state, f);
  e.state.files[pdf].parents = ["outro_parent_123"];
  e.state.uuids = [uid(850)];
  assert.equal(
    e.ctx.registrarHoleritePiloto(
      { funcionario_id: id, competencia: "2026-10", arquivo_id: pdf },
      op2,
    ).resultado,
    "PARCIAL",
  );
  e.state.uuids = [uid(850), uid(851)];
  e.ctx.registrarHoleritePiloto(
    { funcionario_id: id, competencia: "2026-09", arquivo_id: pdf },
    uid(903),
  );
  const ops = e.state.abas.Operacoes.data;
  const recursos = ops.slice(2).map((row) => JSON.parse(row[7]));
  assert.equal(recursos[0].documento_id, uid(850));
  assert.equal(recursos[1].documento_id, uid(851));
});
test("limite JSON conta UTF8 antes de write", () => {
  const e = ambiente();
  const id = cadastrar(e),
    f = funcionario(e.state),
    t = e.ctx.lerBaseRh_({ planilha: e.state.props.RH_PLANILHA_ID });
  for (let n = 0; n < 100; n++) {
    const arquivo = "arquivo_grande_" + n;
    const nome = "界".repeat(176) + ".pdf";
    e.state.files[arquivo] = {
      id: arquivo,
      name: nome,
      mimeType: "application/pdf",
      trashed: false,
      driveId: e.state.props.INDICES_DRIVE_ID,
      parents: [f.pasta_id],
    };
    t.Holerites.push({
      id: uid(1000 + n),
      funcionario_id: id,
      competencia: "2026-" + String((n % 12) + 1).padStart(2, "0"),
      arquivo_id: arquivo,
      nome_arquivo: nome,
      data_upload: new Date(),
      status: "ATIVO",
    });
  }
  const count = e.state.updates;
  assert.throws(
    () =>
      e.ctx.publicarIndiceRh_(t, f, {
        raiz: e.state.props.RH_RAIZ_HOLERITES_ID,
        drive: e.state.props.INDICES_DRIVE_ID,
      }),
    (err) => err.codigoRh === "LIMITE_INDICE",
  );
  assert.equal(e.state.updates, count);
});
