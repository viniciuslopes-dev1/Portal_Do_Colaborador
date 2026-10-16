const DOMINIO_CORPORATIVO_ = 'armazenamentoemnuvem.com';
const PROPRIEDADE_PERMITIDOS_ = 'PILOTO_RH_EMAILS';

/** Autoriza antes de avaliar o template fixo da interface. */
function doGet() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== 'SUCESSO') {
    return HtmlService.createHtmlOutput('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Acesso negado</title><main><h1>Acesso negado</h1><p>Não foi possível autorizar esta conta. Procure o responsável pelo piloto.</p></main></html>');
  }
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('Painel RH — piloto');
}

/** Não aceita identidade, perfil ou autorização enviados pelo navegador. */
function obterSessao() {
  return autorizarSessao_();
}

function autorizarSessao_() {
  try {
    const ativo = normalizarEmail_(Session.getActiveUser().getEmail());
    const efetivo = normalizarEmail_(Session.getEffectiveUser().getEmail());
    if (!ativo || !efetivo || ativo !== efetivo) return negar_();
    const permitidos = lerPermitidos_();
    if (!permitidos || permitidos.indexOf(ativo) === -1) return negar_();
    return { resultado: 'SUCESSO', codigo: 'SESSAO_AUTORIZADA', email: ativo, perfil: 'RH' };
  } catch (erro) {
    return negar_();
  }
}

function normalizarEmail_(valor) {
  if (typeof valor !== 'string' || valor.length > 254 || valor !== valor.trim()) return null;
  const email = valor.toLowerCase();
  const partes = email.split('@');
  if (partes.length !== 2 || partes[1] !== DOMINIO_CORPORATIVO_) return null;
  const local = partes[0];
  if (!local || local.length > 64 || !/^[a-z0-9]+(?:[._+-][a-z0-9]+)*$/.test(local)) return null;
  return email;
}

function lerPermitidos_() {
  const bruto = PropertiesService.getScriptProperties().getProperty(PROPRIEDADE_PERMITIDOS_);
  if (typeof bruto !== 'string' || !bruto || bruto.length > 9000) return null;
  const lista = JSON.parse(bruto);
  if (!Array.isArray(lista) || lista.length === 0 || lista.length > 100) return null;
  const normalizados = [];
  for (let i = 0; i < lista.length; i++) {
    const email = normalizarEmail_(lista[i]);
    if (!email || normalizados.indexOf(email) !== -1) return null;
    normalizados.push(email);
  }
  return normalizados;
}

function negar_() {
  return { resultado: 'ERRO', codigo: 'ACESSO_NEGADO', mensagem: 'Não foi possível autorizar esta conta. Procure o responsável pelo piloto.' };
}

/** Inclusão privada restrita aos fragmentos estáticos da interface. */
function incluir_(nome) {
  if (nome !== 'Styles' && nome !== 'Scripts') {
    throw new Error('RECURSO_NAO_PERMITIDO');
  }
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}
