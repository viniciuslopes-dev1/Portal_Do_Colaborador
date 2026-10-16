const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
function ambiente() {
  const s = {
    autorizado: true,
    props: {},
    leituras: 0,
    logs: [],
    calls: [],
    locked: false,
    seq: 1,
  };
  const ctx = vm.createContext({
    console: { log: (x) => s.logs.push(x) },
    autorizarSessao_: () =>
      s.autorizado
        ? { resultado: "SUCESSO", email: "rh@armazenamentoemnuvem.com" }
        : { resultado: "ERRO" },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => {
          s.leituras++;
          return s.props[k] ?? null;
        },
        setProperty: (k, v) => (s.props[k] = v),
      }),
    },
    LockService: {
      getScriptLock: () => ({
        tryLock() {
          assert.equal(s.locked, false);
          s.locked = true;
          return true;
        },
        hasLock: () => s.locked,
        releaseLock: () => (s.locked = false),
      }),
    },
    textoPessoalRh_: (v, n) =>
      typeof v === "string" &&
      v.length > 0 &&
      v.length <= n &&
      !/^[=+@-]/.test(v),
    normalizarEmail_: (v) =>
      typeof v === "string" && v.endsWith("@armazenamentoemnuvem.com")
        ? v.toLowerCase()
        : null,
    competenciaRhValida_: (v) => /^2026-(0[1-9]|1[0-2])$/.test(v),
    idRecursoRhValido_: (v) => typeof v === "string" && v.length >= 10,
    chavesExatasRh_: (o, k) =>
      o &&
      typeof o === "object" &&
      Object.keys(o).length === k.length &&
      k.every((x) => Object.hasOwn(o, x)),
    falharRh_: (c) => {
      throw { codigoRh: c };
    },
    codigoErroRh_: (e) => e?.codigoRh ?? "FALHA_ADMINISTRATIVA",
    resumoRh_: (d) =>
      crypto.createHash("sha256").update(JSON.stringify(d)).digest("hex"),
    uuidRhValido_: (v) => /^00000000-0000-4000-8000-\d{12}$/.test(v),
    gerarUuidRh_: () =>
      "00000000-0000-4000-8000-" + String(s.seq++).padStart(12, "0"),
    cadastrarFuncionario: (d, op) => {
      assert.equal(s.locked, false);
      s.calls.push({ d, op });
      return {
        resultado: "SUCESSO",
        codigo: "FUNCIONARIO_CADASTRADO",
        email: d.email,
      };
    },
    registrarHoleritePiloto: (d, op) => {
      assert.equal(s.locked, false);
      s.calls.push({ d, op });
      return { resultado: "SUCESSO", codigo: "HOLERITE_REGISTRADO" };
    },
    executarRh_: (fn) =>
      s.autorizado
        ? fn({}, {})
        : { resultado: "ERRO", codigo: "ACESSO_NEGADO" },
    lerBaseRh_: () => ({
      Funcionarios: [
        {
          funcionario_id: "00000000-0000-4000-8000-000000000555",
          email: "teste@armazenamentoemnuvem.com",
          ativo: "SIM",
        },
      ],
    }),
    publicarIndice: (id) => ({
      resultado: "SUCESSO",
      codigo: "INDICE_PUBLICADO",
      id,
    }),
  });
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../rh/Piloto.gs"), "utf8"),
    ctx,
  );
  return { s, ctx };
}
const cadastro = {
  nome: "Pessoa fictícia",
  email: "teste@armazenamentoemnuvem.com",
  setor: "Teste",
};
test("privadas negam antes ler propriedades; logs sem PII", () => {
  const { s, ctx } = ambiente();
  s.autorizado = false;
  for (const nome of [
    "executarCadastrosPiloto_",
    "executarVinculosPiloto_",
    "renovarIndicesPiloto_",
  ])
    assert.equal(ctx[nome]()[0].codigo, "ACESSO_NEGADO");
  assert.equal(s.leituras, 0);
  assert.equal(s.calls.length, 0);
  assert.equal(
    s.logs.some((x) => x.includes("@")),
    false,
  );
});
test("cadastro rerun reutiliza operação e libera lock antes API", () => {
  const { s, ctx } = ambiente();
  s.props.PILOTO_CADASTROS_JSON = JSON.stringify([cadastro]);
  ctx.executarCadastrosPiloto_();
  ctx.executarCadastrosPiloto_();
  assert.equal(s.calls[0].op, s.calls[1].op);
  assert.equal(
    s.logs.some((x) => x.includes(cadastro.email) || x.includes(cadastro.nome)),
    false,
  );
});
test("pedido alterado recebe operação nova; schema integral valida antes API", () => {
  const { s, ctx } = ambiente();
  s.props.PILOTO_CADASTROS_JSON = JSON.stringify([cadastro]);
  ctx.executarCadastrosPiloto_();
  s.props.PILOTO_CADASTROS_JSON = JSON.stringify([
    { ...cadastro, setor: "Outro" },
  ]);
  ctx.executarCadastrosPiloto_();
  assert.notEqual(s.calls[0].op, s.calls[1].op);
  s.props.PILOTO_CADASTROS_JSON = JSON.stringify([
    cadastro,
    { ...cadastro, extra: true },
  ]);
  assert.equal(
    ctx.executarCadastrosPiloto_()[0].codigo,
    "CONFIGURACAO_INVALIDA",
  );
  assert.equal(s.calls.length, 2);
});
test("limite20 e JSON inválido rejeitados sem API", () => {
  const { s, ctx } = ambiente();
  for (const raw of ["{", "[]", JSON.stringify(Array(21).fill(cadastro))]) {
    s.props.PILOTO_CADASTROS_JSON = raw;
    assert.equal(ctx.executarCadastrosPiloto_()[0].resultado, "ERRO");
  }
  assert.equal(s.calls.length, 0);
});
test("vinculo resolve email para UUID privado e reserva operação estável", () => {
  const { s, ctx } = ambiente();
  s.props.PILOTO_VINCULOS_JSON = JSON.stringify([
    {
      email: cadastro.email,
      competencia: "2026-10",
      arquivo_id: "arquivo_ficticio_123",
    },
  ]);
  ctx.executarVinculosPiloto_();
  ctx.executarVinculosPiloto_();
  assert.equal(
    s.calls[0].d.funcionario_id,
    "00000000-0000-4000-8000-000000000555",
  );
  assert.equal(s.calls[0].op, s.calls[1].op);
  assert.equal(
    s.logs.some((x) => x.includes("arquivo_ficticio") || x.includes("@")),
    false,
  );
});
test("renovação retorna somente códigos de cada posição", () => {
  const { ctx } = ambiente();
  const r = ctx.renovarIndicesPiloto_();
  assert.equal(r[0].codigo, "INDICE_PUBLICADO");
  assert.deepEqual(Object.keys(r[0]).sort(), [
    "codigo",
    "posicao",
    "resultado",
  ]);
});

test("comandos do editor sem sufixo negam não RH antes de IO", () => {
  const { ctx, s } = ambiente();
  s.autorizado = false;
  for (const nome of [
    "executarCadastrosPiloto",
    "executarVinculosPiloto",
    "renovarIndicesPiloto",
  ]) {
    const r = ctx[nome]();
    assert.equal(r[0].codigo, "ACESSO_NEGADO");
  }
  assert.equal(s.leituras, 0);
  assert.equal(s.calls.length, 0);
});
