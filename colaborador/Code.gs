const DOMINIO_CORPORATIVO_ = "armazenamentoemnuvem.com";

/** Autoriza antes de avaliar o template fixo da interface. */
function doGet() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") {
    return HtmlService.createHtmlOutput(
      '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Acesso negado</title><main><h1>Acesso negado</h1><p>Não foi possível autorizar esta conta. Procure o responsável pelo piloto.</p></main></html>',
    );
  }
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("Portal do colaborador — piloto");
}

/** Não aceita identidade, perfil ou autorização enviados pelo navegador. */
function obterSessao() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") return sessao;
  return {
    resultado: sessao.resultado,
    codigo: sessao.codigo,
    email: sessao.email,
    perfil: sessao.perfil,
  };
}

function autorizarSessao_() {
  try {
    const ativo = normalizarEmail_(Session.getActiveUser().getEmail());
    const efetivo = normalizarEmail_(Session.getEffectiveUser().getEmail());
    if (!ativo || !efetivo || ativo !== efetivo) return negar_();
    const fonte = perfilDrive_(ativo);
    if (fonte.erro) return fonte.erro;
    return {
      _indice: fonte.perfil,
      resultado: "SUCESSO",
      codigo: "SESSAO_AUTORIZADA",
      email: ativo,
      perfil: "COLABORADOR",
    };
  } catch (erro) {
    return negar_();
  }
}

function normalizarEmail_(valor) {
  if (typeof valor !== "string" || valor.length > 254 || valor !== valor.trim())
    return null;
  const email = valor.toLowerCase();
  const partes = email.split("@");
  if (partes.length !== 2 || partes[1] !== DOMINIO_CORPORATIVO_) return null;
  const local = partes[0];
  if (
    !local ||
    local.length > 64 ||
    !/^[a-z0-9]+(?:[._+-][a-z0-9]+)*$/.test(local)
  )
    return null;
  return email;
}

function negar_() {
  return {
    resultado: "ERRO",
    codigo: "ACESSO_NEGADO",
    mensagem:
      "Não foi possível autorizar esta conta. Procure o responsável pelo piloto.",
  };
}

/** Inclusão privada restrita aos fragmentos estáticos da interface. */
function incluir_(nome) {
  if (nome !== "Styles" && nome !== "Scripts") {
    throw new Error("RECURSO_NAO_PERMITIDO");
  }
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}
