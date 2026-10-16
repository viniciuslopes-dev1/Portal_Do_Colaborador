/** Leitura autorizada pelo índice individual publicado pelo RH. */
function listarHolerites() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") return sessao;
  const configuracao = { perfil: sessao._indice };
  try {
    conferirPasta_(configuracao.perfil.pasta_id);
    const documentos = configuracao.perfil.documentos.map(function (documento) {
      conferirPdf_(documento.arquivo_id, configuracao.perfil.pasta_id, false);
      return {
        arquivo_id: documento.arquivo_id,
        competencia: documento.competencia,
        data_disponibilizacao: documento.data_upload,
      };
    });
    documentos.sort(function (a, b) {
      return b.competencia.localeCompare(a.competencia);
    });
    return {
      resultado: "SUCESSO",
      codigo: "HOLERITES_LISTADOS",
      documentos: documentos,
    };
  } catch (erro) {
    return erroDrive_("DOCUMENTO_INDISPONIVEL");
  }
}

function obterLinkHolerite(arquivoId, acao) {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") return sessao;
  if (
    !idDriveValido_(arquivoId) ||
    (acao !== "VISUALIZAR" && acao !== "BAIXAR")
  ) {
    return erroDrive_("SOLICITACAO_INVALIDA");
  }
  const configuracao = { perfil: sessao._indice };
  const perfil = configuracao.perfil;
  if (
    !perfil.documentos.some(function (d) {
      return d.arquivo_id === arquivoId;
    })
  ) {
    return erroDrive_("DOCUMENTO_INDISPONIVEL");
  }
  try {
    conferirPasta_(perfil.pasta_id);
    const arquivo = conferirPdf_(arquivoId, perfil.pasta_id, true);
    if (
      acao === "BAIXAR" &&
      (!arquivo.capabilities || arquivo.capabilities.canDownload !== true)
    ) {
      return erroDrive_("LINK_INDISPONIVEL");
    }
    const url =
      acao === "BAIXAR" ? arquivo.webContentLink : arquivo.webViewLink;
    if (!linkDriveValido_(url, arquivoId, acao))
      return erroDrive_("LINK_INDISPONIVEL");
    return { resultado: "SUCESSO", codigo: "LINK_AUTORIZADO", url: url };
  } catch (erro) {
    return erroDrive_("DOCUMENTO_INDISPONIVEL");
  }
}

function objetoComChaves_(objeto, chaves) {
  return (
    objeto !== null &&
    typeof objeto === "object" &&
    !Array.isArray(objeto) &&
    Object.keys(objeto).length === chaves.length &&
    chaves.every(function (chave) {
      return Object.prototype.hasOwnProperty.call(objeto, chave);
    })
  );
}

function idDriveValido_(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{10,200}$/.test(id);
}

function conferirPasta_(pastaId) {
  const pasta = Drive.Files.get(pastaId, {
    supportsAllDrives: true,
    fields: "id,mimeType,trashed,driveId,capabilities(canEdit)",
  });
  if (
    !pasta ||
    pasta.id !== pastaId ||
    pasta.mimeType !== "application/vnd.google-apps.folder" ||
    pasta.trashed !== false ||
    pasta.driveId !== driveIndiceConfiavel_() ||
    !pasta.capabilities ||
    pasta.capabilities.canEdit !== false
  )
    throw new Error("RECURSO");
}

function conferirPdf_(arquivoId, pastaId, links) {
  const fields =
    "id,mimeType,trashed,parents,driveId,capabilities(canEdit,canDownload)" +
    (links ? ",webViewLink,webContentLink" : "");
  const arquivo = Drive.Files.get(arquivoId, {
    supportsAllDrives: true,
    fields: fields,
  });
  if (
    !arquivo ||
    arquivo.id !== arquivoId ||
    arquivo.mimeType !== "application/pdf" ||
    arquivo.trashed !== false ||
    arquivo.driveId !== driveIndiceConfiavel_() ||
    !arquivo.capabilities ||
    arquivo.capabilities.canEdit !== false ||
    !Array.isArray(arquivo.parents) ||
    arquivo.parents.length !== 1 ||
    arquivo.parents[0] !== pastaId
  )
    throw new Error("RECURSO");
  return arquivo;
}

/** Aceita apenas links retornados pela API, com host e referência exatos. */
function linkDriveValido_(url, arquivoId, acao) {
  if (typeof url !== "string" || url.length > 4096 || /[\s\\]/.test(url))
    return false;
  const partes =
    /^https:\/\/(drive\.google\.com|drive\.usercontent\.google\.com)(\/[^?#]*)(?:\?([^#]*))?$/.exec(
      url,
    );
  if (!partes) return false;
  const host = partes[1],
    caminho = partes[2],
    query = partes[3] || "";
  let idQuery = null;
  try {
    const parametros = query ? query.split("&") : [];
    for (let i = 0; i < parametros.length; i++) {
      const par = parametros[i].split("=");
      const chave = decodeURIComponent(par[0]);
      if (
        ["id", "export", "authuser", "confirm", "usp", "resourcekey"].indexOf(
          chave,
        ) === -1 ||
        par.length !== 2
      )
        return false;
      const valor = decodeURIComponent(par[1]);
      if (chave === "id") {
        if (idQuery !== null || valor !== arquivoId) return false;
        idQuery = valor;
      }
    }
  } catch (erro) {
    return false;
  }
  if (acao === "VISUALIZAR") {
    return (
      host === "drive.google.com" &&
      ((caminho === "/file/d/" + arquivoId + "/view" &&
        (idQuery === null || idQuery === arquivoId)) ||
        (caminho === "/open" && idQuery === arquivoId))
    );
  }
  return (
    idQuery === arquivoId &&
    ((host === "drive.google.com" && caminho === "/uc") ||
      (host === "drive.usercontent.google.com" && caminho === "/download"))
  );
}

function erroDrive_(codigo) {
  const mensagens = {
    CONFIGURACAO_PENDENTE:
      "Os documentos deste piloto ainda não foram configurados.",
    CONFIGURACAO_INVALIDA:
      "Não foi possível validar a configuração dos documentos.",
    SOLICITACAO_INVALIDA: "A solicitação de documento é inválida.",
    DOCUMENTO_INDISPONIVEL:
      "Não foi possível acessar os documentos autorizados. Procure o responsável pelo piloto.",
    LINK_INDISPONIVEL: "Esta ação não está disponível para o documento.",
  };
  return { resultado: "ERRO", codigo: codigo, mensagem: mensagens[codigo] };
}
