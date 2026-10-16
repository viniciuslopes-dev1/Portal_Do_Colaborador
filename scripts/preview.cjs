// Prévia LOCAL com Session simulada. Nunca copiar este arquivo ao Apps Script.
// Não testa OAuth, identidade Google, permissões Drive ou autorização real.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORTAL_PREVIEW_PORT || 4173);
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }
  const projeto = { "/colaborador": "colaborador", "/rh": "rh" }[url.pathname];
  if (!projeto) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Prévia local: /colaborador ou /rh");
    return;
  }
  try {
    let html = fs.readFileSync(path.join(root, projeto, "Index.html"), "utf8");
    html = html.replace(
      /<\?!=\s*incluir_\('(Styles|Scripts)'\);?\s*\?>/g,
      (_, nome) =>
        fs.readFileSync(path.join(root, projeto, nome + ".html"), "utf8"),
    );
    const mock = `<script>
window.__previewState = 'ok';
window.__previewDriveState = 'ok';
window.__previewProfileState = 'ok';
window.__previewLinkState = 'indisponivel';
window.google = {script: { get run() {
  var success, failure;
  function respond(method, args) {
    setTimeout(function() {
      if (window.__previewState === 'erro') { if (failure) failure(new Error('Simulação local')); return; }
      if (window.__previewState === 'negado') { if (success) success({resultado:'ERRO',codigo:'ACESSO_NEGADO'}); return; }
      var response;
      if (method === 'obterSessao') {
        response = {resultado:'SUCESSO',codigo:'SESSAO_AUTORIZADA',perfil:'${projeto === "rh" ? "RH" : "COLABORADOR"}',email:window.__previewEmail || 'conta.demo@example.invalid'};
      } else if (method === 'obterPerfil') {
        response = window.__previewProfileState === 'ok'
          ? {resultado:'SUCESSO',codigo:'PERFIL_AUTORIZADO',perfil:{nome:'Pessoa de Demonstração',setor:'Operações',email:window.__previewEmail || 'conta.demo@example.invalid'}}
          : {resultado:'ERRO',codigo:window.__previewProfileState};
      } else if (method === 'listarHolerites') {
        var state = window.__previewDriveState;
        if (state === 'erro') { if (failure) failure(new Error('Falha de leitura simulada')); return; }
        if (state === 'config') response = {resultado:'ERRO',codigo:'CONFIGURACAO_PENDENTE'};
        else response = {resultado:'SUCESSO',codigo:'HOLERITES_LISTADOS',documentos:state === 'vazio' ? [] : (window.__previewDocuments || [
          {arquivo_id:'arquivo_demo_A_202609',competencia:'2026-09',data_disponibilizacao:'2026-10-01T12:00:00.000Z'},
          {arquivo_id:'arquivo_demo_A_202608',competencia:'2026-08',data_disponibilizacao:'2026-09-01T12:00:00.000Z'},
          {arquivo_id:'arquivo_demo_A_202512',competencia:'2025-12',data_disponibilizacao:'2026-01-01T12:00:00.000Z'}
        ])};
      } else if (method === 'obterLinkHolerite') {
        // Não há PDF real na prévia. Somente QA interceptada pode simular links.
        var linkState = window.__previewLinkState;
        response = linkState === 'ok' ? {resultado:'SUCESSO',codigo:'LINK_AUTORIZADO',url:args[1] === 'BAIXAR'
          ? 'https://drive.usercontent.google.com/download?id='+args[0]+'&export=download'
          : 'https://drive.google.com/file/d/'+args[0]+'/view?usp=drivesdk'}
          : linkState === 'inseguro' ? {resultado:'SUCESSO',codigo:'LINK_AUTORIZADO',url:'https://example.invalid/indevido'}
          : {resultado:'ERRO',codigo:'LINK_INDISPONIVEL'};
      }
      if (success) success(response);
    }, 120);
  }
  var chain = {
    withSuccessHandler: function(fn) {success = fn; return chain;},
    withFailureHandler: function(fn) {failure = fn; return chain;},
    obterSessao: function() {respond('obterSessao', []);},
    obterPerfil: function() {respond('obterPerfil', []);},
    listarHolerites: function() {respond('listarHolerites', []);},
    obterLinkHolerite: function(id, action) {respond('obterLinkHolerite', [id, action]);}
  };
  return chain;
}}};
</script>`;
    html = html.replace(
      "</head>",
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        mock +
        "</head>",
    );
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(html);
  } catch {
    res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Arquivos da interface ainda indisponíveis.");
  }
});
server.listen(port, "127.0.0.1", () => {
  console.log(
    `Prévia LOCAL (sessão fictícia): http://127.0.0.1:${port}/colaborador e /rh`,
  );
});
