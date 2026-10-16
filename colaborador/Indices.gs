// A confiança exige escrita exclusiva de RH/técnicos aprovados em TODO o Drive.
// Nome é apenas descoberta. Não há fallback ao mapa da Etapa 04.
function obterPerfil() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") return sessao;
  const fonte = { perfil: sessao._indice };
  return {
    resultado: "SUCESSO",
    codigo: "PERFIL_AUTORIZADO",
    perfil: {
      nome: fonte.perfil.nome,
      setor: fonte.perfil.setor,
      email: fonte.perfil.email,
    },
  };
}

function driveIndiceConfiavel_() {
  const id =
    PropertiesService.getScriptProperties().getProperty("INDICES_DRIVE_ID");
  if (!idDriveValido_(id)) throw new Error("CONFIGURACAO_PENDENTE");
  return id;
}

function perfilDrive_(email) {
  try {
    const origem = driveIndiceConfiavel_();
    const vistos = new Set(),
      tokens = new Set();
    let pagina,
      encontrado = null,
      total = 0,
      paginas = 0;
    do {
      if (++paginas > 20) throw new Error("INDICE_INDISPONIVEL");
      const parametros = {
        q: "trashed = false and mimeType = 'application/json' and name = 'portal-indice.json'",
        spaces: "drive",
        corpora: "user",
        pageSize: 100,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields:
          "nextPageToken,incompleteSearch,files(id,name,mimeType,trashed,driveId,parents,size,version,capabilities(canEdit))",
      };
      if (pagina) parametros.pageToken = pagina;
      const resposta = Drive.Files.list(parametros);
      if (
        !resposta ||
        resposta.incompleteSearch === true ||
        !Array.isArray(resposta.files)
      )
        throw new Error("INDICE_INDISPONIVEL");
      for (const candidato of resposta.files) {
        if (++total > 2000) throw new Error("INDICE_INDISPONIVEL");
        if (!candidato || candidato.driveId !== origem) continue;
        if (!idDriveValido_(candidato.id) || vistos.has(candidato.id))
          throw new Error("INDICE_INVALIDO");
        vistos.add(candidato.id);
        const indice = lerIndice_(candidato.id, origem);
        if (indice.email !== email) continue;
        if (encontrado) throw new Error("INDICE_AMBIGUO");
        encontrado = indice;
      }
      pagina = resposta.nextPageToken;
      if (
        pagina !== undefined &&
        (typeof pagina !== "string" || !pagina || tokens.has(pagina))
      )
        throw new Error("INDICE_INDISPONIVEL");
      if (pagina) tokens.add(pagina);
    } while (pagina);
    if (!encontrado) throw new Error("INDICE_AUSENTE");
    if (!encontrado.ativo) throw new Error("INDICE_INATIVO");
    if (Date.parse(encontrado.valido_ate) <= Date.now())
      throw new Error("INDICE_EXPIRADO");
    conferirPasta_(encontrado.pasta_id);
    return { perfil: encontrado };
  } catch (erro) {
    return { erro: erroIndice_(erro && erro.message) };
  }
}

function metadadosIndice_(id, origem) {
  const file = Drive.Files.get(id, {
    supportsAllDrives: true,
    fields:
      "id,name,mimeType,trashed,driveId,parents,size,version,capabilities(canEdit)",
  });
  if (
    !file ||
    file.id !== id ||
    file.name !== "portal-indice.json" ||
    file.mimeType !== "application/json" ||
    file.trashed !== false ||
    file.driveId !== origem ||
    !file.capabilities ||
    file.capabilities.canEdit !== false ||
    !Array.isArray(file.parents) ||
    file.parents.length !== 1 ||
    !idDriveValido_(file.parents[0]) ||
    typeof file.size !== "string" ||
    !/^[0-9]+$/.test(file.size) ||
    Number(file.size) < 2 ||
    Number(file.size) > 65536 ||
    typeof file.version !== "string" ||
    !/^[1-9][0-9]{0,30}$/.test(file.version)
  )
    throw new Error("INDICE_INVALIDO");
  return file;
}

function lerIndice_(id, origem) {
  const antes = metadadosIndice_(id, origem);
  // O Advanced Service pode entregar conteúdo media como string, Blob ou JSON.
  // Todas as formas passam pelo mesmo limite e esquema, nunca metadados livres.
  const media = Drive.Files.get(id, { alt: "media", supportsAllDrives: true });
  let texto;
  if (typeof media === "string") texto = media;
  else if (media && typeof media.getDataAsString === "function")
    texto = media.getDataAsString("UTF-8");
  else if (media && typeof media === "object" && !Array.isArray(media))
    texto = JSON.stringify(media);
  else throw new Error("INDICE_INVALIDO");
  if (
    typeof texto !== "string" ||
    encodeURIComponent(texto).replace(/%[A-F0-9]{2}|[^%]/g, "x").length > 65536
  )
    throw new Error("INDICE_INVALIDO");
  const depois = metadadosIndice_(id, origem);
  if (
    antes.version !== depois.version ||
    antes.parents[0] !== depois.parents[0]
  )
    throw new Error("INDICE_INDISPONIVEL");
  const indice = JSON.parse(texto);
  validarIndice_(indice, depois);
  return indice;
}

function uuidIndiceValido_(id) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

function textoIndiceValido_(texto, maximo) {
  return (
    typeof texto === "string" &&
    texto === texto.trim() &&
    texto.length > 0 &&
    texto.length <= maximo &&
    !/[\u0000-\u001f\u007f]/.test(texto)
  );
}

function dataIndiceValida_(texto) {
  if (
    typeof texto !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(texto)
  )
    return false;
  const tempo = Date.parse(texto);
  return Number.isFinite(tempo) && new Date(tempo).toISOString() === texto;
}

function validarIndice_(indice, file) {
  const chaves = [
    "schema_version",
    "indice_id",
    "funcionario_id",
    "email",
    "nome",
    "setor",
    "ativo",
    "revisao",
    "emitido_em",
    "valido_ate",
    "pasta_id",
    "documentos",
  ];
  if (
    !objetoComChaves_(indice, chaves) ||
    indice.schema_version !== 1 ||
    indice.indice_id !== file.id ||
    !uuidIndiceValido_(indice.funcionario_id) ||
    normalizarEmail_(indice.email) !== indice.email ||
    !textoIndiceValido_(indice.nome, 180) ||
    !textoIndiceValido_(indice.setor, 100) ||
    typeof indice.ativo !== "boolean" ||
    !Number.isSafeInteger(indice.revisao) ||
    indice.revisao < 1 ||
    !idDriveValido_(indice.pasta_id) ||
    indice.pasta_id === file.id ||
    file.parents[0] !== indice.pasta_id ||
    !dataIndiceValida_(indice.emitido_em) ||
    !dataIndiceValida_(indice.valido_ate) ||
    !Array.isArray(indice.documentos) ||
    indice.documentos.length > 100
  )
    throw new Error("INDICE_INVALIDO");
  const emissao = Date.parse(indice.emitido_em),
    validade = Date.parse(indice.valido_ate),
    agora = Date.now();
  if (
    emissao > agora + 60000 ||
    validade <= emissao ||
    validade - emissao > 86400000
  )
    throw new Error("INDICE_INVALIDO");
  const ids = new Set(),
    competencias = new Set(),
    arquivos = new Set();
  for (const doc of indice.documentos) {
    if (
      !objetoComChaves_(doc, [
        "id",
        "competencia",
        "arquivo_id",
        "nome_arquivo",
        "data_upload",
      ]) ||
      !uuidIndiceValido_(doc.id) ||
      ids.has(doc.id.toLowerCase()) ||
      typeof doc.competencia !== "string" ||
      !/^(?!0000)[0-9]{4}-(0[1-9]|1[0-2])$/.test(doc.competencia) ||
      competencias.has(doc.competencia) ||
      !idDriveValido_(doc.arquivo_id) ||
      arquivos.has(doc.arquivo_id) ||
      doc.arquivo_id === file.id ||
      doc.arquivo_id === indice.pasta_id ||
      !textoIndiceValido_(doc.nome_arquivo, 180) ||
      /[\\/]/.test(doc.nome_arquivo) ||
      !dataIndiceValida_(doc.data_upload) ||
      Date.parse(doc.data_upload) > agora + 60000
    )
      throw new Error("INDICE_INVALIDO");
    ids.add(doc.id.toLowerCase());
    competencias.add(doc.competencia);
    arquivos.add(doc.arquivo_id);
  }
}

function erroIndice_(codigo) {
  const mensagens = {
    CONFIGURACAO_PENDENTE: "A origem dos índices ainda não foi configurada.",
    INDICE_AUSENTE: "Seu cadastro ainda não está disponível. Procure o RH.",
    INDICE_INVALIDO: "Não foi possível validar seu cadastro. Procure o RH.",
    INDICE_AMBIGUO: "Não foi possível validar seu cadastro. Procure o RH.",
    INDICE_INATIVO: "Seu acesso está inativo. Procure o RH.",
    INDICE_EXPIRADO: "Seu cadastro precisa ser atualizado pelo RH.",
    INDICE_INDISPONIVEL:
      "Não foi possível consultar seu cadastro. Tente novamente.",
  };
  const seguro = Object.prototype.hasOwnProperty.call(mensagens, codigo)
    ? codigo
    : "INDICE_INDISPONIVEL";
  return { resultado: "ERRO", codigo: seguro, mensagem: mensagens[seguro] };
}
