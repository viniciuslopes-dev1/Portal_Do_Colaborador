const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const email = "teste.a@armazenamentoemnuvem.com";
const outro = "teste.b@armazenamentoemnuvem.com";
const drive = "drive_confiavel_123";
const pasta = "pasta_individual_123";
const indice = "indice_publicado_123";
const arquivo = "arquivo_pdf_123456";
function carregar() {
  const agora = Date.now();
  const payload = {
    schema_version: 1,
    indice_id: indice,
    funcionario_id: "550e8400-e29b-41d4-a716-446655440000",
    email,
    nome: "Pessoa de Teste",
    setor: "Operações",
    ativo: true,
    revisao: 1,
    emitido_em: new Date(agora - 1000).toISOString(),
    valido_ate: new Date(agora + 3600000).toISOString(),
    pasta_id: pasta,
    documentos: [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        competencia: "2026-09",
        arquivo_id: arquivo,
        nome_arquivo: "2026-09.pdf",
        data_upload: new Date(agora - 1000).toISOString(),
      },
    ],
  };
  const state = {
    email,
    efetivo: email,
    origem: drive,
    payload,
    payloads: {},
    files: {},
    calls: [],
    pages: null,
    media: "object",
    version: "1",
    falhaApi: false,
  };
  function metadata(id) {
    if (id === indice || state.payloads[id])
      return {
        id,
        name: "portal-indice.json",
        mimeType: "application/json",
        trashed: false,
        driveId: drive,
        parents: [pasta],
        size: String(
          Buffer.byteLength(JSON.stringify(state.payloads[id] || payload)),
        ),
        version: state.version,
        capabilities: { canEdit: false },
        ...state.files[id],
      };
    if (id === pasta)
      return {
        id,
        mimeType: "application/vnd.google-apps.folder",
        trashed: false,
        driveId: drive,
        capabilities: { canEdit: false },
        ...state.files[id],
      };
    return {
      id,
      mimeType: "application/pdf",
      trashed: false,
      driveId: drive,
      parents: [pasta],
      capabilities: { canEdit: false, canDownload: true },
      webViewLink:
        "https://drive.google.com/file/d/" + id + "/view?usp=drivesdk",
      webContentLink:
        "https://drive.usercontent.google.com/download?id=" +
        id +
        "&export=download",
      ...state.files[id],
    };
  }
  const ctx = vm.createContext({
    Session: {
      getActiveUser: () => ({ getEmail: () => state.email }),
      getEffectiveUser: () => ({ getEmail: () => state.efetivo }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) =>
          key === "INDICES_DRIVE_ID" ? state.origem : null,
      }),
    },
    Drive: {
      Files: {
        list: (opts) => {
          state.calls.push({ method: "list", opts });
          if (state.falhaApi) throw Error("detalhe secreto");
          return state.pages
            ? state.pages(opts)
            : { files: [metadata(indice)] };
        },
        get: (id, opts) => {
          state.calls.push({ method: "get", id, opts });
          if (state.falhaApi) throw Error("detalhe secreto");
          if (opts.alt === "media") {
            if (state.mudarVersao)
              state.version = String(Number(state.version) + 1);
            const text =
              state.texto === undefined
                ? JSON.stringify(state.payloads[id] || payload)
                : state.texto;
            return state.media === "blob"
              ? { getDataAsString: () => text }
              : state.media === "string"
                ? text
                : JSON.parse(text);
          }
          return metadata(id);
        },
      },
    },
    HtmlService: {
      createHtmlOutput: (html) => ({ html }),
      createTemplateFromFile: () => ({
        evaluate: () => ({
          addMetaTag() {
            return this;
          },
          setTitle() {
            return this;
          },
        }),
      }),
    },
  });
  for (const name of ["Code.gs", "Drive.gs", "Indices.gs"])
    vm.runInContext(
      fs.readFileSync(
        path.resolve(__dirname, "../../colaborador", name),
        "utf8",
      ),
      ctx,
    );
  return { ctx, state };
}
module.exports = { carregar, email, outro, drive, pasta, indice, arquivo };
