/** Piloto temporário: associação administrativa manual, sem Sheets ou índice automatizado. */
function listarHolerites() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") return sessao;
  const configuracao = perfilDrive_(sessao.email);
  if (configuracao.erro) return configuracao.erro;
  try {
    conferirPasta_(configuracao.perfil.pasta_id);
    const documentos = configuracao.perfil.documentos.map(function (documento) {
      conferirPdf_(documento.arquivo_id, configuracao.perfil.pasta_id, false);
      return {
        arquivo_id: documento.arquivo_id,
        competencia: documento.competencia,
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
  const configuracao = perfilDrive_(sessao.email);
  if (configuracao.erro) return configuracao.erro;
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

function perfilDrive_(email) {
  try {
    const bruto =
      PropertiesService.getScriptProperties().getProperty("PILOTO_DRIVE_MAPA");
    if (bruto === null || bruto === "")
      return { erro: erroDrive_("CONFIGURACAO_PENDENTE") };
    if (
      typeof bruto !== "string" ||
      encodeURIComponent(bruto).replace(/%[A-F0-9]{2}|[^%]/g, "x").length > 9000
    )
      throw new Error("CONFIG");
    const mapa = JSON.parse(bruto);
    if (!Array.isArray(mapa) || mapa.length > 100) throw new Error("CONFIG");
    const emails = [],
      pastas = [],
      arquivos = [];
    let escolhido = null;
    mapa.forEach(function (perfil) {
      if (!objetoComChaves_(perfil, ["email", "pasta_id", "documentos"]))
        throw new Error("CONFIG");
      const normalizado = normalizarEmail_(perfil.email);
      if (
        !normalizado ||
        emails.indexOf(normalizado) !== -1 ||
        !idDriveValido_(perfil.pasta_id) ||
        pastas.indexOf(perfil.pasta_id) !== -1 ||
        !Array.isArray(perfil.documentos) ||
        perfil.documentos.length > 100
      )
        throw new Error("CONFIG");
      emails.push(normalizado);
      pastas.push(perfil.pasta_id);
      const competencias = [];
      perfil.documentos.forEach(function (d) {
        if (
          !objetoComChaves_(d, ["competencia", "arquivo_id"]) ||
          typeof d.competencia !== "string" ||
          !/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(d.competencia) ||
          d.competencia.slice(0, 4) === "0000" ||
          competencias.indexOf(d.competencia) !== -1 ||
          !idDriveValido_(d.arquivo_id) ||
          arquivos.indexOf(d.arquivo_id) !== -1
        )
          throw new Error("CONFIG");
        competencias.push(d.competencia);
        arquivos.push(d.arquivo_id);
      });
      if (normalizado === email) escolhido = perfil;
    });
    if (
      pastas.some(function (pasta) {
        return arquivos.indexOf(pasta) !== -1;
      })
    )
      throw new Error("CONFIG");
    return escolhido
      ? { perfil: escolhido }
      : { erro: erroDrive_("CONFIGURACAO_PENDENTE") };
  } catch (erro) {
    return { erro: erroDrive_("CONFIGURACAO_INVALIDA") };
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
    fields: "id,mimeType,trashed",
  });
  if (
    !pasta ||
    pasta.id !== pastaId ||
    pasta.mimeType !== "application/vnd.google-apps.folder" ||
    pasta.trashed !== false
  )
    throw new Error("RECURSO");
}

function conferirPdf_(arquivoId, pastaId, links) {
  const fields =
    "id,mimeType,trashed,parents" +
    (links ? ",webViewLink,webContentLink,capabilities(canDownload)" : "");
  const arquivo = Drive.Files.get(arquivoId, {
    supportsAllDrives: true,
    fields: fields,
  });
  if (
    !arquivo ||
    arquivo.id !== arquivoId ||
    arquivo.mimeType !== "application/pdf" ||
    arquivo.trashed !== false ||
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
