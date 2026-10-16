/** Persistência administrativa da Etapa 05. Escritas passam pelo mesmo ScriptLock. */
const CABECALHOS_RH_ = {
  Funcionarios: [
    "funcionario_id",
    "nome",
    "email",
    "setor",
    "pasta_id",
    "indice_id",
    "ativo",
    "data_cadastro",
    "data_atualizacao",
    "revisao",
  ],
  Holerites: [
    "id",
    "funcionario_id",
    "competencia",
    "arquivo_id",
    "nome_arquivo",
    "data_upload",
    "responsavel_upload",
    "status",
    "operacao_id",
  ],
  Operacoes: [
    "operacao_id",
    "tipo",
    "responsavel",
    "funcionario_id",
    "resumo_verificavel_do_pedido",
    "estado",
    "fase",
    "recursos_criados",
    "data_inicio",
    "data_atualizacao",
    "codigo_erro_seguro",
  ],
  Auditoria: [
    "evento_id",
    "data",
    "responsavel",
    "acao",
    "funcionario_id",
    "documento_id",
    "operacao_id",
    "resultado",
    "codigo_erro_seguro",
  ],
};

function prepararBase() {
  return executarRh_(function (sessao, config) {
    const base = SpreadsheetApp.openById(config.planilha);
    Object.keys(CABECALHOS_RH_).forEach(function (nome) {
      let aba = base.getSheetByName(nome);
      if (!aba) aba = base.insertSheet(nome);
      const esperado = CABECALHOS_RH_[nome];
      if (aba.getLastRow() === 0) {
        aba
          .getRange(1, 1, 1, esperado.length)
          .setNumberFormat("@")
          .setValues([esperado]);
      }
      conferirCabecalho_(aba, esperado);
    });
    SpreadsheetApp.flush();
    return { resultado: "SUCESSO", codigo: "BASE_PREPARADA" };
  });
}

function cadastrarFuncionario(dados, operacaoId) {
  return executarRh_(function (sessao, config) {
    if (
      !chavesExatasRh_(dados, ["nome", "email", "setor"]) ||
      !textoPessoalRh_(dados.nome, 180) ||
      !textoPessoalRh_(dados.setor, 100) ||
      !normalizarEmail_(dados.email) ||
      !uuidRhValido_(operacaoId)
    )
      falharRh_("DADOS_INVALIDOS");
    const pedido = {
      nome: dados.nome,
      email: normalizarEmail_(dados.email),
      setor: dados.setor,
    };
    const tabelas = lerBaseRh_(config);
    const digest = resumoRh_(pedido);
    let op = obterOperacaoRh_(
      tabelas,
      operacaoId,
      "CADASTRO",
      sessao.email,
      digest,
    );
    let funcionario;
    if (!op) {
      if (
        tabelas.Funcionarios.length >= 200 ||
        tabelas.Funcionarios.some(function (f) {
          return f.email === pedido.email && f.ativo === "SIM";
        })
      )
        falharRh_("CADASTRO_DUPLICADO_OU_LIMITE");
      if (
        tabelas.Operacoes.some(function (o) {
          return (
            o.tipo === "CADASTRO" &&
            o.estado !== "CONCLUIDA" &&
            JSON.parse(o.recursos_criados).email === pedido.email
          );
        })
      )
        falharRh_("CADASTRO_EM_ANDAMENTO");
      const id = gerarUuidRh_(
        tabelas.Funcionarios.map(function (f) {
          return f.funcionario_id;
        }).concat(
          tabelas.Operacoes.map(function (o) {
            return o.funcionario_id;
          }),
        ),
      );
      const agora = new Date();
      op = {
        operacao_id: operacaoId,
        tipo: "CADASTRO",
        responsavel: sessao.email,
        funcionario_id: id,
        resumo_verificavel_do_pedido: digest,
        estado: "EM_ANDAMENTO",
        fase: "RESERVADO",
        recursos_criados: JSON.stringify({ email: pedido.email }),
        data_inicio: agora,
        data_atualizacao: agora,
        codigo_erro_seguro: "",
      };
      adicionarRh_(tabelas, "Operacoes", op);
    }
    try {
      const recursos = JSON.parse(op.recursos_criados);
      const pastaId = criarRecursoRetomavelRh_(
        tabelas,
        op,
        recursos,
        "pasta",
        config.raiz,
        "FUNC_" + op.funcionario_id,
        "application/vnd.google-apps.folder",
        config,
      );
      const indiceId = criarRecursoRetomavelRh_(
        tabelas,
        op,
        recursos,
        "indice",
        pastaId,
        "portal-indice.json",
        "application/json",
        config,
      );
      funcionario = tabelas.Funcionarios.find(function (f) {
        return f.funcionario_id === op.funcionario_id;
      });
      if (!funcionario) {
        if (
          tabelas.Funcionarios.some(function (f) {
            return f.email === pedido.email && f.ativo === "SIM";
          })
        )
          falharRh_("CADASTRO_DUPLICADO_OU_LIMITE");
        const agora = new Date();
        funcionario = {
          funcionario_id: op.funcionario_id,
          nome: pedido.nome,
          email: pedido.email,
          setor: pedido.setor,
          pasta_id: pastaId,
          indice_id: indiceId,
          ativo: "SIM",
          data_cadastro: agora,
          data_atualizacao: agora,
          revisao: 1,
        };
        adicionarRh_(tabelas, "Funcionarios", funcionario);
      }
      if (
        funcionario.email !== pedido.email ||
        funcionario.pasta_id !== pastaId ||
        funcionario.indice_id !== indiceId
      )
        falharRh_("INTEGRIDADE_INVALIDA");
      publicarIndiceRh_(tabelas, funcionario, config);
      concluirOperacaoRh_(tabelas, op, sessao.email, "CADASTRO", "");
      return {
        resultado: "SUCESSO",
        codigo: "FUNCIONARIO_CADASTRADO",
        operacao_id: operacaoId,
        funcionario_id: funcionario.funcionario_id,
      };
    } catch (erro) {
      return parcialRh_(tabelas, op, erro);
    }
  });
}

function publicarIndice(funcionarioId) {
  return executarRh_(function (sessao, config) {
    if (!uuidRhValido_(funcionarioId)) falharRh_("DADOS_INVALIDOS");
    const tabelas = lerBaseRh_(config);
    const funcionario = tabelas.Funcionarios.find(function (f) {
      return f.funcionario_id === funcionarioId;
    });
    if (!funcionario || funcionario.ativo !== "SIM")
      falharRh_("CADASTRO_INDISPONIVEL");
    publicarIndiceRh_(tabelas, funcionario, config);
    auditarRh_(
      tabelas,
      sessao.email,
      "PUBLICAR_INDICE",
      funcionarioId,
      "",
      "",
      "SUCESSO",
      "",
    );
    return {
      resultado: "SUCESSO",
      codigo: "INDICE_PUBLICADO",
      funcionario_id: funcionarioId,
    };
  });
}

/** Registra somente um PDF já existente; não faz upload nem substituição. */
function registrarHoleritePiloto(dados, operacaoId) {
  return executarRh_(function (sessao, config) {
    if (
      !chavesExatasRh_(dados, [
        "funcionario_id",
        "competencia",
        "arquivo_id",
      ]) ||
      !uuidRhValido_(dados.funcionario_id) ||
      !competenciaRhValida_(dados.competencia) ||
      !idRecursoRhValido_(dados.arquivo_id) ||
      !uuidRhValido_(operacaoId)
    )
      falharRh_("DADOS_INVALIDOS");
    const tabelas = lerBaseRh_(config);
    const funcionario = tabelas.Funcionarios.find(function (f) {
      return f.funcionario_id === dados.funcionario_id;
    });
    if (!funcionario || funcionario.ativo !== "SIM")
      falharRh_("CADASTRO_INDISPONIVEL");
    let op = obterOperacaoRh_(
      tabelas,
      operacaoId,
      "REGISTRO_PDF",
      sessao.email,
      resumoRh_(dados),
    );
    const existentes = tabelas.Holerites.filter(function (h) {
      return (
        h.funcionario_id === funcionario.funcionario_id && h.status === "ATIVO"
      );
    });
    if (
      existentes.some(function (h) {
        return (
          h.competencia === dados.competencia && h.operacao_id !== operacaoId
        );
      })
    )
      falharRh_("COMPETENCIA_DUPLICADA");
    if (
      tabelas.Holerites.some(function (h) {
        return (
          h.arquivo_id === dados.arquivo_id && h.operacao_id !== operacaoId
        );
      })
    )
      falharRh_("ARQUIVO_DUPLICADO");
    if (!op && existentes.length >= 100) falharRh_("LIMITE_DOCUMENTOS");
    if (!op) {
      const agora = new Date();
      op = {
        operacao_id: operacaoId,
        tipo: "REGISTRO_PDF",
        responsavel: sessao.email,
        funcionario_id: funcionario.funcionario_id,
        resumo_verificavel_do_pedido: resumoRh_(dados),
        estado: "EM_ANDAMENTO",
        fase: "RESERVADO",
        recursos_criados: JSON.stringify({
          documento_id: gerarUuidRh_(
            tabelas.Holerites.map(function (h) {
              return h.id;
            }).concat(
              tabelas.Operacoes.filter(function (o) {
                return o.tipo === "REGISTRO_PDF";
              }).map(function (o) {
                return JSON.parse(o.recursos_criados).documento_id;
              }),
            ),
          ),
        }),
        data_inicio: agora,
        data_atualizacao: agora,
        codigo_erro_seguro: "",
      };
      adicionarRh_(tabelas, "Operacoes", op);
    }
    try {
      conferirPastaRh_(funcionario.pasta_id, config);
      const pdf = conferirPdfRh_(
        dados.arquivo_id,
        funcionario.pasta_id,
        config,
      );
      let registro = tabelas.Holerites.find(function (h) {
        return h.operacao_id === operacaoId;
      });
      if (!registro) {
        registro = {
          id: JSON.parse(op.recursos_criados).documento_id,
          funcionario_id: funcionario.funcionario_id,
          competencia: dados.competencia,
          arquivo_id: dados.arquivo_id,
          nome_arquivo: pdf.name,
          data_upload: new Date(),
          responsavel_upload: sessao.email,
          status: "ATIVO",
          operacao_id: operacaoId,
        };
        adicionarRh_(tabelas, "Holerites", registro);
        funcionario.revisao++;
        funcionario.data_atualizacao = new Date();
        salvarRh_(tabelas, "Funcionarios", funcionario);
      }
      publicarIndiceRh_(tabelas, funcionario, config);
      concluirOperacaoRh_(
        tabelas,
        op,
        sessao.email,
        "REGISTRO_PDF",
        registro.id,
      );
      return {
        resultado: "SUCESSO",
        codigo: "HOLERITE_REGISTRADO",
        operacao_id: operacaoId,
        documento_id: registro.id,
      };
    } catch (erro) {
      return parcialRh_(tabelas, op, erro);
    }
  });
}

function executarRh_(acao) {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") return sessao;
  let lock;
  try {
    lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) falharRh_("OPERACAO_OCUPADA");
    const props = PropertiesService.getScriptProperties();
    const config = {
      planilha: props.getProperty("RH_PLANILHA_ID"),
      raiz: props.getProperty("RH_RAIZ_HOLERITES_ID"),
      drive: props.getProperty("INDICES_DRIVE_ID"),
    };
    if (
      !idRecursoRhValido_(config.planilha) ||
      !idRecursoRhValido_(config.raiz) ||
      !idRecursoRhValido_(config.drive)
    )
      falharRh_("CONFIGURACAO_PENDENTE");
    conferirPastaRh_(config.raiz, config);
    conferirPlanilhaPrivadaRh_(config.planilha);
    return acao(sessao, config);
  } catch (erro) {
    return {
      resultado: "ERRO",
      codigo: codigoErroRh_(erro),
      mensagem: "Não foi possível concluir a operação administrativa.",
    };
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function conferirPlanilhaPrivadaRh_(id) {
  const arquivo = Drive.Files.get(id, {
    supportsAllDrives: true,
    fields: "id,mimeType,trashed",
  });
  if (
    !arquivo ||
    arquivo.id !== id ||
    arquivo.trashed !== false ||
    arquivo.mimeType !== "application/vnd.google-apps.spreadsheet"
  )
    falharRh_("CONFIGURACAO_INVALIDA");
  const aprovados = lerPermitidos_();
  const permissoes = permissoesRh_(id);
  if (
    permissoes.some(function (p) {
      return (
        !p.deleted &&
        (p.type !== "user" ||
          aprovados.indexOf(normalizarEmail_(p.emailAddress)) === -1)
      );
    })
  )
    falharRh_("PLANILHA_NAO_PRIVADA");
}

function lerBaseRh_(config) {
  const base = SpreadsheetApp.openById(config.planilha);
  const tabelas = { _base: base, _abas: {} };
  Object.keys(CABECALHOS_RH_).forEach(function (nome) {
    const aba = base.getSheetByName(nome);
    if (!aba) falharRh_("BASE_NAO_PREPARADA");
    conferirCabecalho_(aba, CABECALHOS_RH_[nome]);
    const quantidade = aba.getLastRow() - 1;
    const limite =
      nome === "Funcionarios" ? 200 : nome === "Holerites" ? 20000 : 40000;
    if (quantidade > limite) falharRh_("LIMITE_BASE");
    tabelas._abas[nome] = aba;
    if (
      quantidade &&
      aba
        .getRange(2, 1, quantidade, CABECALHOS_RH_[nome].length)
        .getFormulas()
        .some(function (linha) {
          return linha.some(Boolean);
        })
    )
      falharRh_("INTEGRIDADE_INVALIDA");
    tabelas[nome] = quantidade
      ? aba
          .getRange(2, 1, quantidade, CABECALHOS_RH_[nome].length)
          .getValues()
          .map(function (linha, i) {
            const registro = { _linha: i + 2 };
            CABECALHOS_RH_[nome].forEach(function (chave, j) {
              registro[chave] = linha[j];
            });
            return registro;
          })
      : [];
  });
  validarIntegridadeBaseRh_(tabelas);
  return tabelas;
}

function conferirCabecalho_(aba, esperado) {
  if (aba.getLastColumn() !== esperado.length || aba.getLastRow() < 1)
    falharRh_("CABECALHO_INVALIDO");
  const intervalo = aba.getRange(1, 1, 1, esperado.length);
  if (
    JSON.stringify(intervalo.getValues()[0]) !== JSON.stringify(esperado) ||
    intervalo.getFormulas()[0].some(Boolean)
  )
    falharRh_("CABECALHO_INVALIDO");
}

function validarIntegridadeBaseRh_(t) {
  const ids = [],
    emails = [],
    pastas = [],
    indices = [];
  t.Funcionarios.forEach(function (f) {
    if (
      !uuidRhValido_(f.funcionario_id) ||
      ids.indexOf(f.funcionario_id) !== -1 ||
      !normalizarEmail_(f.email) ||
      f.email !== normalizarEmail_(f.email) ||
      !textoPessoalRh_(f.nome, 180) ||
      !textoPessoalRh_(f.setor, 100) ||
      !idRecursoRhValido_(f.pasta_id) ||
      !idRecursoRhValido_(f.indice_id) ||
      pastas.indexOf(f.pasta_id) !== -1 ||
      indices.indexOf(f.indice_id) !== -1 ||
      ["SIM", "NAO"].indexOf(f.ativo) === -1 ||
      !Number.isSafeInteger(f.revisao) ||
      f.revisao < 1
    )
      falharRh_("INTEGRIDADE_INVALIDA");
    ids.push(f.funcionario_id);
    pastas.push(f.pasta_id);
    indices.push(f.indice_id);
    if (f.ativo === "SIM") {
      if (emails.indexOf(f.email) !== -1) falharRh_("INTEGRIDADE_INVALIDA");
      emails.push(f.email);
    }
  });
  const documentos = [],
    arquivos = [],
    competencias = [];
  t.Holerites.forEach(function (h) {
    if (
      !uuidRhValido_(h.id) ||
      documentos.indexOf(h.id) !== -1 ||
      ids.indexOf(h.funcionario_id) === -1 ||
      !competenciaRhValida_(h.competencia) ||
      !idRecursoRhValido_(h.arquivo_id) ||
      arquivos.indexOf(h.arquivo_id) !== -1 ||
      !nomeArquivoRhValido_(h.nome_arquivo) ||
      ["ATIVO", "ARQUIVADO"].indexOf(h.status) === -1 ||
      !uuidRhValido_(h.operacao_id)
    )
      falharRh_("INTEGRIDADE_INVALIDA");
    documentos.push(h.id);
    arquivos.push(h.arquivo_id);
    if (h.status === "ATIVO") {
      const chave = h.funcionario_id + "|" + h.competencia;
      if (competencias.indexOf(chave) !== -1) falharRh_("INTEGRIDADE_INVALIDA");
      competencias.push(chave);
    }
  });
  const operacoes = [];
  t.Operacoes.forEach(function (o) {
    if (
      !uuidRhValido_(o.operacao_id) ||
      operacoes.indexOf(o.operacao_id) !== -1 ||
      !uuidRhValido_(o.funcionario_id) ||
      ["CADASTRO", "REGISTRO_PDF"].indexOf(o.tipo) === -1 ||
      ["EM_ANDAMENTO", "CONCLUIDA", "PARCIAL", "FALHA"].indexOf(o.estado) ===
        -1 ||
      typeof o.recursos_criados !== "string" ||
      o.recursos_criados.length > 4000
    )
      falharRh_("INTEGRIDADE_INVALIDA");
    JSON.parse(o.recursos_criados);
    operacoes.push(o.operacao_id);
  });
}

function adicionarRh_(t, nome, objeto) {
  objeto._linha = t._abas[nome].getLastRow() + 1;
  salvarRh_(t, nome, objeto);
  t[nome].push(objeto);
}

function salvarRh_(t, nome, objeto) {
  const cabecalho = CABECALHOS_RH_[nome];
  const valores = cabecalho.map(function (chave) {
    return objeto[chave];
  });
  const range = t._abas[nome].getRange(objeto._linha, 1, 1, cabecalho.length);
  range.setNumberFormat("@").setValues([valores]);
  cabecalho.forEach(function (chave, i) {
    if (valores[i] instanceof Date)
      t._abas[nome]
        .getRange(objeto._linha, i + 1)
        .setNumberFormat("yyyy-mm-dd hh:mm:ss");
  });
  SpreadsheetApp.flush();
}

function obterOperacaoRh_(t, id, tipo, responsavel, digest) {
  const op = t.Operacoes.find(function (o) {
    return o.operacao_id === id;
  });
  if (
    op &&
    (op.tipo !== tipo ||
      op.responsavel !== responsavel ||
      op.resumo_verificavel_do_pedido !== digest)
  )
    falharRh_("OPERACAO_CONFLITANTE");
  return op || null;
}

function criarRecursoRetomavelRh_(
  t,
  op,
  recursos,
  tipo,
  parent,
  nome,
  mime,
  config,
) {
  if (recursos[tipo]) {
    conferirRecursoRh_(recursos[tipo], parent, mime, config);
    return recursos[tipo];
  }
  const marcador = resumoRh_({ operacao_id: op.operacao_id, tipo: tipo });
  const resposta = Drive.Files.list({
    q:
      "'" +
      parent +
      "' in parents and trashed = false and appProperties has { key='portal_operacao' and value='" +
      marcador +
      "' }",
    spaces: "drive",
    corpora: "drive",
    driveId: config.drive,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    pageSize: 100,
    fields: "files(id),nextPageToken,incompleteSearch",
  });
  if (
    resposta.incompleteSearch ||
    resposta.nextPageToken ||
    !Array.isArray(resposta.files) ||
    resposta.files.length > 1
  )
    falharRh_("RECURSO_AMBIGUO");
  if (resposta.files.length === 1) {
    recursos[tipo] = resposta.files[0].id;
    op.recursos_criados = JSON.stringify(recursos);
    salvarRh_(t, "Operacoes", op);
    conferirRecursoRh_(recursos[tipo], parent, mime, config);
    return recursos[tipo];
  }
  if (recursos[tipo + "_tentado"]) falharRh_("CRIACAO_INDETERMINADA");
  recursos[tipo + "_tentado"] = true;
  op.recursos_criados = JSON.stringify(recursos);
  op.fase = "CRIANDO_" + tipo.toUpperCase();
  op.data_atualizacao = new Date();
  salvarRh_(t, "Operacoes", op);
  const criado = Drive.Files.create(
    {
      name: nome,
      mimeType: mime,
      parents: [parent],
      appProperties: { portal_operacao: marcador },
    },
    null,
    { supportsAllDrives: true, fields: "id" },
  );
  if (!criado || !idRecursoRhValido_(criado.id))
    falharRh_("CRIACAO_INDETERMINADA");
  recursos[tipo] = criado.id;
  op.recursos_criados = JSON.stringify(recursos);
  salvarRh_(t, "Operacoes", op);
  conferirRecursoRh_(criado.id, parent, mime, config);
  return criado.id;
}

function conferirRecursoRh_(id, parent, mime, config) {
  const recurso = Drive.Files.get(id, {
    supportsAllDrives: true,
    fields: "id,name,mimeType,trashed,parents,driveId",
  });
  if (
    !recurso ||
    recurso.id !== id ||
    recurso.mimeType !== mime ||
    recurso.trashed !== false ||
    recurso.driveId !== config.drive ||
    !Array.isArray(recurso.parents) ||
    recurso.parents.length !== 1 ||
    recurso.parents[0] !== parent
  )
    falharRh_("RECURSO_INVALIDO");
  return recurso;
}
function conferirPastaRh_(id, config) {
  const pasta = Drive.Files.get(id, {
    supportsAllDrives: true,
    fields: "id,mimeType,trashed,driveId",
  });
  if (
    !pasta ||
    pasta.id !== id ||
    pasta.mimeType !== "application/vnd.google-apps.folder" ||
    pasta.trashed !== false ||
    pasta.driveId !== config.drive
  )
    falharRh_("RECURSO_INVALIDO");
}
function conferirPdfRh_(id, parent, config) {
  const pdf = conferirRecursoRh_(id, parent, "application/pdf", config);
  if (!nomeArquivoRhValido_(pdf.name)) falharRh_("NOME_ARQUIVO_INVALIDO");
  return pdf;
}

function publicarIndiceRh_(t, f, config) {
  if (f.ativo !== "SIM") falharRh_("CADASTRO_INDISPONIVEL");
  conferirRecursoRh_(
    f.pasta_id,
    config.raiz,
    "application/vnd.google-apps.folder",
    config,
  );
  conferirRecursoRh_(f.indice_id, f.pasta_id, "application/json", config);
  const docs = t.Holerites.filter(function (h) {
    return h.funcionario_id === f.funcionario_id && h.status === "ATIVO";
  });
  if (docs.length > 100) falharRh_("LIMITE_DOCUMENTOS");
  const documentos = docs.map(function (h) {
    conferirPdfRh_(h.arquivo_id, f.pasta_id, config);
    return {
      id: h.id,
      competencia: h.competencia,
      arquivo_id: h.arquivo_id,
      nome_arquivo: h.nome_arquivo,
      data_upload: dataIsoRh_(h.data_upload),
    };
  });
  const agora = new Date();
  const indice = {
    schema_version: 1,
    indice_id: f.indice_id,
    funcionario_id: f.funcionario_id,
    email: f.email,
    nome: f.nome,
    setor: f.setor,
    ativo: true,
    revisao: f.revisao,
    emitido_em: agora.toISOString(),
    valido_ate: new Date(agora.getTime() + 86400000).toISOString(),
    pasta_id: f.pasta_id,
    documentos: documentos,
  };
  const texto = JSON.stringify(indice);
  if (
    encodeURIComponent(texto).replace(/%[A-F0-9]{2}|[^%]/g, "x").length > 65536
  )
    falharRh_("LIMITE_INDICE");
  conferirFilhosRh_(
    f.pasta_id,
    [f.indice_id].concat(
      documentos.map(function (d) {
        return d.arquivo_id;
      }),
    ),
    config,
  );
  // Verifica ACLs antes de publicar qualquer dado pessoal.
  garantirLeitorRh_(f.pasta_id, f.email);
  garantirLeitorRh_(f.indice_id, f.email);
  documentos.forEach(function (d) {
    garantirLeitorRh_(d.arquivo_id, f.email);
  });
  Drive.Files.update(
    { name: "portal-indice.json", mimeType: "application/json" },
    f.indice_id,
    Utilities.newBlob(texto, "application/json", "portal-indice.json"),
    { supportsAllDrives: true, fields: "id" },
  );
  conferirRecursoRh_(f.indice_id, f.pasta_id, "application/json", config);
  const publicado = DriveApp.getFileById(f.indice_id)
    .getBlob()
    .getDataAsString("UTF-8");
  if (publicado !== texto) falharRh_("PUBLICACAO_NAO_CONFIRMADA");
}

/** Compartilhar a pasta alcança todos os filhos: recusa conteúdo inesperado. */
function conferirFilhosRh_(pastaId, esperados, config) {
  const encontrados = [];
  let token;
  do {
    const pagina = Drive.Files.list({
      q: "'" + pastaId + "' in parents and trashed = false",
      corpora: "drive",
      driveId: config.drive,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      pageSize: 100,
      fields: "files(id),nextPageToken,incompleteSearch",
      pageToken: token,
    });
    if (!pagina || pagina.incompleteSearch || !Array.isArray(pagina.files))
      falharRh_("CONTEUDO_PASTA_INVALIDO");
    pagina.files.forEach(function (f) {
      if (esperados.indexOf(f.id) === -1 || encontrados.indexOf(f.id) !== -1)
        falharRh_("CONTEUDO_PASTA_INVALIDO");
      encontrados.push(f.id);
    });
    if (encontrados.length > 101) falharRh_("CONTEUDO_PASTA_INVALIDO");
    token = pagina.nextPageToken;
  } while (token);
  if (encontrados.length !== esperados.length)
    falharRh_("CONTEUDO_PASTA_INVALIDO");
}

function permissoesRh_(id) {
  const todas = [];
  let token;
  do {
    const pagina = Drive.Permissions.list(id, {
      supportsAllDrives: true,
      fields: "permissions(id,type,role,emailAddress,deleted),nextPageToken",
      pageSize: 100,
      pageToken: token,
    });
    if (!pagina || !Array.isArray(pagina.permissions))
      falharRh_("PERMISSAO_INVALIDA");
    todas.push.apply(todas, pagina.permissions);
    if (todas.length > 500) falharRh_("PERMISSAO_INVALIDA");
    token = pagina.nextPageToken;
  } while (token);
  return todas;
}
function garantirLeitorRh_(id, email) {
  function conferir(lista) {
    const aprovados = lerPermitidos_();
    lista.forEach(function (p) {
      if (p.deleted) return;
      if (p.type !== "user") falharRh_("PERMISSAO_AMPLA");
      const destinatario = normalizarEmail_(p.emailAddress);
      if (destinatario === email) {
        if (p.role !== "reader") falharRh_("PERMISSAO_INDEVIDA");
      } else if (!destinatario || aprovados.indexOf(destinatario) === -1)
        falharRh_("PERMISSAO_INDEVIDA");
    });
    return lista.some(function (p) {
      return (
        !p.deleted &&
        p.type === "user" &&
        normalizarEmail_(p.emailAddress) === email &&
        p.role === "reader"
      );
    });
  }
  if (!conferir(permissoesRh_(id)))
    Drive.Permissions.create(
      { type: "user", role: "reader", emailAddress: email },
      id,
      { supportsAllDrives: true, sendNotificationEmail: false, fields: "id" },
    );
  if (!conferir(permissoesRh_(id))) falharRh_("PERMISSAO_NAO_CONFIRMADA");
}
function concluirOperacaoRh_(t, op, responsavel, acao, documentoId) {
  if (
    !t.Auditoria.some(function (a) {
      return (
        a.operacao_id === op.operacao_id &&
        a.acao === acao &&
        a.resultado === "SUCESSO"
      );
    })
  )
    auditarRh_(
      t,
      responsavel,
      acao,
      op.funcionario_id,
      documentoId,
      op.operacao_id,
      "SUCESSO",
      "",
    );
  op.estado = "CONCLUIDA";
  op.fase = "CONCLUIDA";
  op.codigo_erro_seguro = "";
  op.data_atualizacao = new Date();
  salvarRh_(t, "Operacoes", op);
}
function parcialRh_(t, op, erro) {
  op.estado = "PARCIAL";
  op.codigo_erro_seguro = codigoErroRh_(erro);
  op.data_atualizacao = new Date();
  try {
    salvarRh_(t, "Operacoes", op);
  } catch (ignorado) {}
  return {
    resultado: "PARCIAL",
    codigo: op.codigo_erro_seguro,
    mensagem:
      "A operação requer retomada com o mesmo identificador e os mesmos dados.",
    operacao_id: op.operacao_id,
    retomavel: true,
  };
}
function auditarRh_(
  t,
  responsavel,
  acao,
  funcionario,
  documento,
  operacao,
  resultado,
  codigo,
) {
  adicionarRh_(t, "Auditoria", {
    evento_id: gerarUuidRh_(
      t.Auditoria.map(function (a) {
        return a.evento_id;
      }),
    ),
    data: new Date(),
    responsavel: responsavel,
    acao: acao,
    funcionario_id: funcionario,
    documento_id: documento,
    operacao_id: operacao,
    resultado: resultado,
    codigo_erro_seguro: codigo,
  });
}
function resumoRh_(dados) {
  const canonico = Object.keys(dados)
    .sort()
    .map(function (k) {
      return [k, dados[k]];
    });
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(canonico),
  )
    .map(function (b) {
      return ("0" + ((b + 256) % 256).toString(16)).slice(-2);
    })
    .join("");
}
function gerarUuidRh_(existentes) {
  for (let i = 0; i < 5; i++) {
    const id = Utilities.getUuid().toLowerCase();
    if (uuidRhValido_(id) && existentes.indexOf(id) === -1) return id;
  }
  falharRh_("ID_NAO_DISPONIVEL");
}
function uuidRhValido_(id) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      id,
    )
  );
}
function idRecursoRhValido_(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{10,200}$/.test(id);
}
function nomeArquivoRhValido_(nome) {
  return textoPessoalRh_(nome, 180) && !/[\\/]/.test(nome);
}
function textoPessoalRh_(texto, max) {
  return (
    typeof texto === "string" &&
    texto.length > 0 &&
    texto.length <= max &&
    texto === texto.trim() &&
    !/^[=+@-]/.test(texto) &&
    !/[\u0000-\u001f\u007f]/.test(texto)
  );
}
function competenciaRhValida_(v) {
  return (
    typeof v === "string" &&
    /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(v) &&
    v.slice(0, 4) !== "0000"
  );
}
function chavesExatasRh_(obj, chaves) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === chaves.length &&
    chaves.every(function (c) {
      return Object.prototype.hasOwnProperty.call(obj, c);
    })
  );
}
function dataIsoRh_(valor) {
  if (!(valor instanceof Date) || !Number.isFinite(valor.getTime()))
    falharRh_("DATA_INVALIDA");
  return valor.toISOString();
}
function falharRh_(codigo) {
  const erro = new Error("OPERACAO_ADMINISTRATIVA");
  erro.codigoRh = codigo;
  throw erro;
}
function codigoErroRh_(erro) {
  const permitidos = [
    "LIMITE_INDICE",
    "CONTEUDO_PASTA_INVALIDO",
    "DADOS_INVALIDOS",
    "CADASTRO_DUPLICADO_OU_LIMITE",
    "CADASTRO_EM_ANDAMENTO",
    "INTEGRIDADE_INVALIDA",
    "CADASTRO_INDISPONIVEL",
    "COMPETENCIA_DUPLICADA",
    "ARQUIVO_DUPLICADO",
    "LIMITE_DOCUMENTOS",
    "OPERACAO_OCUPADA",
    "CONFIGURACAO_PENDENTE",
    "CONFIGURACAO_INVALIDA",
    "PLANILHA_NAO_PRIVADA",
    "BASE_NAO_PREPARADA",
    "LIMITE_BASE",
    "CABECALHO_INVALIDO",
    "OPERACAO_CONFLITANTE",
    "RECURSO_AMBIGUO",
    "CRIACAO_INDETERMINADA",
    "RECURSO_INVALIDO",
    "NOME_ARQUIVO_INVALIDO",
    "PUBLICACAO_NAO_CONFIRMADA",
    "PERMISSAO_INVALIDA",
    "PERMISSAO_AMPLA",
    "PERMISSAO_INDEVIDA",
    "PERMISSAO_NAO_CONFIRMADA",
    "ID_NAO_DISPONIVEL",
    "DATA_INVALIDA",
  ];
  return erro && permitidos.indexOf(erro.codigoRh) !== -1
    ? erro.codigoRh
    : "FALHA_ADMINISTRATIVA";
}
