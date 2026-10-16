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
window.google = {script: { get run() {
  var success, failure;
  var chain = {
    withSuccessHandler: function(fn) {success = fn; return chain;},
    withFailureHandler: function(fn) {failure = fn; return chain;},
    obterSessao: function() {setTimeout(function() {
      if (window.__previewState === 'erro') { if (failure) failure(new Error('Simulação local')); return; }
      if (success) success(window.__previewState === 'negado' ?
        {resultado:'ERRO',codigo:'ACESSO_NEGADO'} :
        {resultado:'SUCESSO',codigo:'SESSAO_AUTORIZADA',perfil:'${projeto === "rh" ? "RH" : "COLABORADOR"}',email:window.__previewEmail || 'conta.demo@example.invalid'});
    }, 120);}
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
