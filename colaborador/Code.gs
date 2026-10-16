const DOMINIO_CORPORATIVO_ = 'armazenamentoemnuvem.com';
const PROPRIEDADE_PERMITIDOS_ = 'PILOTO_COLABORADORES_EMAILS';

/** Entrada do piloto: autentica antes de entregar o diagnóstico. */
function doGet() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== 'SUCESSO') {
    return HtmlService.createHtmlOutput('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Acesso negado</title><main><h1>Acesso negado</h1><p>Não foi possível autorizar esta conta. Procure o responsável pelo piloto.</p></main></html>');
  }
  return HtmlService.createHtmlOutput(paginaDiagnostico_()).setTitle('Portal do colaborador — piloto');
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
    return { resultado: 'SUCESSO', codigo: 'SESSAO_AUTORIZADA', email: ativo, perfil: 'COLABORADOR' };
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

function paginaDiagnostico_() {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Portal do colaborador — piloto</title></head>
<body><main><h1>Portal do colaborador — piloto</h1><p>Diagnóstico de autenticação — Etapa 02</p><p id="estado" role="status" aria-live="polite">Verificando sessão...</p><button type="button" id="verificar">Verificar novamente</button></main>
<script>
(function () {
  'use strict';
  var estado = document.getElementById('estado');
  var botao = document.getElementById('verificar');
  function falhou() {
    estado.textContent = 'Não foi possível autorizar esta conta. Procure o responsável pelo piloto.';
    botao.disabled = false;
  }
  function verificar() {
    botao.disabled = true;
    estado.textContent = 'Verificando sessão...';
    try {
      google.script.run.withSuccessHandler(function (resposta) {
        botao.disabled = false;
        if (!resposta || resposta.resultado !== 'SUCESSO' || resposta.codigo !== 'SESSAO_AUTORIZADA') {
          falhou();
          return;
        }
        estado.textContent = 'Sessão autorizada: ' + resposta.email + ' | Perfil: ' + resposta.perfil;
      }).withFailureHandler(falhou).obterSessao();
    } catch (erro) {
      falhou();
    }
  }
  botao.addEventListener('click', verificar);
  verificar();
}());
</script></body></html>`;
}
