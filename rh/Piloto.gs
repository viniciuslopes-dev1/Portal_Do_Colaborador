/** Utilitários privados para execução guiada pelo editor. Não criam telas ou gatilhos. */
function executarCadastrosPiloto_() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO")
    return relatarPiloto_([
      { posicao: 0, resultado: "ERRO", codigo: "ACESSO_NEGADO" },
    ]);
  try {
    const cadastros = lerListaPiloto_("PILOTO_CADASTROS_JSON", [
      "nome",
      "email",
      "setor",
    ]);
    if (
      !cadastros.every(function (d) {
        return (
          textoPessoalRh_(d.nome, 180) &&
          normalizarEmail_(d.email) &&
          textoPessoalRh_(d.setor, 100)
        );
      })
    )
      falharRh_("DADOS_INVALIDOS");
    return relatarPiloto_(
      cadastros.map(function (d, i) {
        try {
          const pedido = {
            nome: d.nome,
            email: normalizarEmail_(d.email),
            setor: d.setor,
          };
          const op = reservarOperacaoPiloto_("CADASTRO", pedido);
          return resumoResultadoPiloto_(
            i + 1,
            cadastrarFuncionario(pedido, op),
          );
        } catch (erro) {
          return resumoResultadoPiloto_(i + 1, {
            resultado: "ERRO",
            codigo: codigoErroRh_(erro),
          });
        }
      }),
    );
  } catch (erro) {
    return relatarPiloto_([
      resumoResultadoPiloto_(0, {
        resultado: "ERRO",
        codigo: codigoErroRh_(erro),
      }),
    ]);
  }
}

function executarVinculosPiloto_() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO")
    return relatarPiloto_([
      { posicao: 0, resultado: "ERRO", codigo: "ACESSO_NEGADO" },
    ]);
  try {
    const vinculos = lerListaPiloto_("PILOTO_VINCULOS_JSON", [
      "email",
      "competencia",
      "arquivo_id",
    ]);
    if (
      !vinculos.every(function (d) {
        return (
          normalizarEmail_(d.email) &&
          competenciaRhValida_(d.competencia) &&
          idRecursoRhValido_(d.arquivo_id)
        );
      })
    )
      falharRh_("DADOS_INVALIDOS");
    return relatarPiloto_(
      vinculos.map(function (d, i) {
        try {
          const resolucao = executarRh_(function (s, config) {
            const encontrados = lerBaseRh_(config).Funcionarios.filter(
              function (f) {
                return (
                  f.ativo === "SIM" && f.email === normalizarEmail_(d.email)
                );
              },
            );
            if (encontrados.length !== 1) falharRh_("CADASTRO_INDISPONIVEL");
            return {
              resultado: "SUCESSO",
              funcionario_id: encontrados[0].funcionario_id,
            };
          });
          if (resolucao.resultado !== "SUCESSO")
            return resumoResultadoPiloto_(i + 1, resolucao);
          const pedido = {
            funcionario_id: resolucao.funcionario_id,
            competencia: d.competencia,
            arquivo_id: d.arquivo_id,
          };
          const op = reservarOperacaoPiloto_("REGISTRO_PDF", pedido);
          return resumoResultadoPiloto_(
            i + 1,
            registrarHoleritePiloto(pedido, op),
          );
        } catch (erro) {
          return resumoResultadoPiloto_(i + 1, {
            resultado: "ERRO",
            codigo: codigoErroRh_(erro),
          });
        }
      }),
    );
  } catch (erro) {
    return relatarPiloto_([
      resumoResultadoPiloto_(0, {
        resultado: "ERRO",
        codigo: codigoErroRh_(erro),
      }),
    ]);
  }
}

function renovarIndicesPiloto_() {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO")
    return relatarPiloto_([
      { posicao: 0, resultado: "ERRO", codigo: "ACESSO_NEGADO" },
    ]);
  const resolucao = executarRh_(function (s, config) {
    const ativos = lerBaseRh_(config).Funcionarios.filter(function (f) {
      return f.ativo === "SIM";
    });
    if (ativos.length > 200) falharRh_("LIMITE_BASE");
    return {
      resultado: "SUCESSO",
      ids: ativos.map(function (f) {
        return f.funcionario_id;
      }),
    };
  });
  if (resolucao.resultado !== "SUCESSO")
    return relatarPiloto_([resumoResultadoPiloto_(0, resolucao)]);
  return relatarPiloto_(
    resolucao.ids.map(function (id, i) {
      return resumoResultadoPiloto_(i + 1, publicarIndice(id));
    }),
  );
}

function lerListaPiloto_(nome, chaves) {
  const bruto = PropertiesService.getScriptProperties().getProperty(nome);
  if (
    typeof bruto !== "string" ||
    !bruto ||
    encodeURIComponent(bruto).replace(/%[A-F0-9]{2}|[^%]/g, "x").length > 9000
  )
    falharRh_("CONFIGURACAO_INVALIDA");
  let lista;
  try {
    lista = JSON.parse(bruto);
  } catch (erro) {
    falharRh_("CONFIGURACAO_INVALIDA");
  }
  if (
    !Array.isArray(lista) ||
    lista.length < 1 ||
    lista.length > 20 ||
    !lista.every(function (d) {
      return chavesExatasRh_(d, chaves);
    })
  )
    falharRh_("CONFIGURACAO_INVALIDA");
  return lista;
}

function reservarOperacaoPiloto_(tipo, pedido) {
  const sessao = autorizarSessao_();
  if (sessao.resultado !== "SUCESSO") falharRh_("OPERACAO_CONFLITANTE");
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(5000)) falharRh_("OPERACAO_OCUPADA");
    const props = PropertiesService.getScriptProperties();
    const chave =
      "PILOTO_OP_" +
      resumoRh_({
        tipo: tipo,
        responsavel: sessao.email,
        pedido: JSON.stringify(
          Object.keys(pedido)
            .sort()
            .map(function (k) {
              return [k, pedido[k]];
            }),
        ),
      });
    const existente = props.getProperty(chave);
    if (existente !== null) {
      if (!uuidRhValido_(existente)) falharRh_("INTEGRIDADE_INVALIDA");
      return existente;
    }
    const gerado = gerarUuidRh_([]);
    props.setProperty(chave, gerado);
    if (props.getProperty(chave) !== gerado) falharRh_("INTEGRIDADE_INVALIDA");
    return gerado;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function resumoResultadoPiloto_(posicao, resposta) {
  const resultados = ["SUCESSO", "PARCIAL", "ERRO"];
  const codigosSucesso = [
    "FUNCIONARIO_CADASTRADO",
    "HOLERITE_REGISTRADO",
    "INDICE_PUBLICADO",
  ];
  const codigo =
    codigosSucesso.indexOf(resposta && resposta.codigo) !== -1
      ? resposta.codigo
      : resposta && resposta.codigo === "ACESSO_NEGADO"
        ? "ACESSO_NEGADO"
        : codigoErroRh_({ codigoRh: resposta && resposta.codigo });
  return {
    posicao: posicao,
    resultado:
      resposta && resultados.indexOf(resposta.resultado) !== -1
        ? resposta.resultado
        : "ERRO",
    codigo: codigo,
  };
}
function relatarPiloto_(resumo) {
  console.log(JSON.stringify(resumo));
  return resumo;
}
