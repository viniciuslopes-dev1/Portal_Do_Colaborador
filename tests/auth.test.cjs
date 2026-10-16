// Serviços simulados: não comprovam identidade, OAuth ou implantação Google.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const email = "teste.a@armazenamentoemnuvem.com";
const outro = "teste.b@armazenamentoemnuvem.com";

for (const projeto of ["rh"]) {
  const chave =
    projeto === "rh" ? "PILOTO_RH_EMAILS" : "PILOTO_COLABORADORES_EMAILS";
  const fonte = fs.readFileSync(path.join(root, projeto, "Code.gs"), "utf8");
  function carregar(opcoes = {}) {
    const config = Object.assign(
      { ativo: email, efetivo: email, lista: JSON.stringify([email]) },
      opcoes,
    );
    const estado = { ...config, templates: [], inclusoes: [], avaliacoes: 0 };
    const contexto = vm.createContext({
      Session: {
        getActiveUser: () => ({ getEmail: () => estado.ativo }),
        getEffectiveUser: () => ({ getEmail: () => estado.efetivo }),
      },
      PropertiesService: {
        getScriptProperties: () => ({
          getProperty: (nome) => {
            assert.equal(nome, chave);
            if (estado.falha) throw Error("detalhe privado");
            return estado.lista;
          },
        }),
      },
      HtmlService: {
        createHtmlOutput: (html) => ({
          html,
          setTitle() {
            return this;
          },
        }),
        createTemplateFromFile: (nome) => {
          estado.templates.push(nome);
          return {
            evaluate() {
              estado.avaliacoes++;
              return {
                html: "TEMPLATE_AVALIADO",
                metas: [],
                addMetaTag(nome, valor) {
                  this.metas.push([nome, valor]);
                  return this;
                },
                setTitle() {
                  return this;
                },
              };
            },
          };
        },
        createHtmlOutputFromFile: (nome) => {
          estado.inclusoes.push(nome);
          return { getContent: () => "CONTEUDO_" + nome };
        },
      },
    });
    vm.runInContext(fonte, contexto);
    return { contexto, estado };
  }
  test(`${projeto}: autorizado, template fixo e manifesto`, () => {
    const { contexto } = carregar();
    const resposta = contexto.obterSessao();
    assert.equal(resposta.resultado, "SUCESSO");
    assert.equal(resposta.email, email);
    assert.equal(resposta.perfil, projeto === "rh" ? "RH" : "COLABORADOR");
    const output = contexto.doGet({ parameter: { template: "../../outro" } });
    assert.equal(output.html, "TEMPLATE_AVALIADO");
    assert.equal(output.metas[0][0], "viewport");
    assert.equal(output.metas[0][1], "width=device-width, initial-scale=1");
    const manifesto = JSON.parse(
      fs.readFileSync(path.join(root, projeto, "appsscript.json"), "utf8"),
    );
    assert.deepEqual(manifesto.webapp, {
      access: "DOMAIN",
      executeAs: "USER_ACCESSING",
    });
    assert.deepEqual(
      manifesto.oauthScopes,
      projeto === "colaborador"
        ? [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/drive.readonly",
          ]
        : [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/spreadsheets",
          ],
    );
    assert.equal(manifesto.timeZone, "America/Sao_Paulo");
    const publicas = [...fonte.matchAll(/^function (\w+)\(/gm)]
      .map((x) => x[1])
      .filter((x) => !x.endsWith("_"));
    assert.deepEqual(publicas.sort(), ["doGet", "obterSessao"]);
  });
  test(`${projeto}: template ignora parâmetros e inclusão restringe arquivos`, () => {
    const { contexto, estado } = carregar();
    contexto.doGet({
      parameter: { template: "Outro", nome: "Code", email: outro },
    });
    assert.deepEqual(estado.templates, ["Index"]);
    assert.equal(estado.avaliacoes, 1);
    assert.equal(contexto.incluir_("Styles"), "CONTEUDO_Styles");
    assert.equal(contexto.incluir_("Scripts"), "CONTEUDO_Scripts");
    for (const nome of ["Index", "Code", "../Styles", "", null, {}, "styles"]) {
      assert.throws(() => contexto.incluir_(nome), /RECURSO_NAO_PERMITIDO/);
    }
    assert.deepEqual(estado.inclusoes, ["Styles", "Scripts"]);
  });
  const casos = [
    ["identidade vazia", { ativo: "" }],
    ["efetiva vazia", { efetivo: "" }],
    ["execução com outra identidade", { efetivo: outro }],
    ["externa", { ativo: "a@example.com", efetivo: "a@example.com" }],
    [
      "sufixo de domínio falso",
      { ativo: "a@armazenamentoemnuvem.com.example.com" },
    ],
    ["conta interna sem autorização", { ativo: outro, efetivo: outro }],
    ["configuração ausente", { lista: null }],
    ["configuração vazia", { lista: "" }],
    ["JSON inválido", { lista: "[quebrado" }],
    ["objeto em vez de lista", { lista: "{}" }],
    ["lista vazia", { lista: "[]" }],
    ["membro inválido na lista", { lista: JSON.stringify([email, 42]) }],
    ["externo na lista", { lista: JSON.stringify([email, "a@example.com"]) }],
    [
      "duplicidade sem diferença de caixa",
      { lista: JSON.stringify([email, email.toUpperCase()]) },
    ],
    ["erro do serviço", { falha: true }],
  ];
  for (const [cenario, opcoes] of casos)
    test(`${projeto}: nega ${cenario}`, () => {
      const { contexto, estado } = carregar(opcoes);
      const resposta = contexto.obterSessao({ email, perfil: "RH" });
      assert.equal(resposta.resultado, "ERRO");
      assert.equal(resposta.codigo, "ACESSO_NEGADO");
      assert.equal(resposta.email, undefined);
      assert.doesNotMatch(JSON.stringify(resposta), /detalhe privado|stack/);
      const html = contexto.doGet({ parameter: { email, perfil: "RH" } }).html;
      assert.match(html, /Acesso negado/);
      assert.doesNotMatch(html, /google.script.run/);
      assert.equal(estado.templates.length, 0);
      assert.equal(estado.avaliacoes, 0);
    });
  test(`${projeto}: reautoriza chamada após remoção da lista`, () => {
    const { contexto, estado } = carregar();
    assert.equal(contexto.obterSessao().resultado, "SUCESSO");
    estado.lista = JSON.stringify([outro]);
    assert.equal(contexto.obterSessao().resultado, "ERRO");
    assert.match(contexto.doGet().html, /Acesso negado/);
  });
}
