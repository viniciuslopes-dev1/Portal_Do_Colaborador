# Requisitos do produto

## Funcionário

RF01. Entrar com Google corporativo, sem senha própria do portal.
RF02. Reconhecer identidade no servidor e aceitar somente cadastro autorizado e ativo.
RF03. Exibir nome, setor, e-mail e holerites; não exibir matrícula ou exigir ID manual.
RF04. Listar competências por ano/mês, visualizar e baixar somente PDFs autorizados.
RF05. Mostrar carregamento, ausência de documentos, acesso negado e falhas com mensagens claras.
RF06. Impedir consulta de perfil, pasta, índice ou PDF de outra pessoa, inclusive com link direto e manipulação de parâmetros.

## RH

RF07. Autorizar contas RH explicitamente no backend, independentemente dos botões exibidos.
RF08. Cadastrar nome, e-mail corporativo e setor. Gerar funcionario_id automaticamente e criar/associar pasta e índice.
RF09. Consultar e editar cadastro. Alterar nome/setor sem alterar ID. Mudança de e-mail exige operação controlada de identidade e permissões.
RF10. Selecionar destinatário por nome e e-mail, informar competência e enviar PDF sem copiar IDs manualmente na rotina final.
RF11. Impedir duplicação de cadastro e de holerite ativo por funcionário/competência.
RF12. Corrigir documentos com confirmação, arquivamento restrito e rastreabilidade; não apagar automaticamente.
RF13. Desativar cadastro, bloquear índice e revogar acesso efetivo ao Drive, apresentando pendências de revogação.
RF14. Consultar histórico, auditoria e operações pendentes; retomar falhas sem duplicar recursos.

## Requisitos gerais

Interface responsiva, acessível, legível e simples. Planilha central privada, nenhum link público, menor privilégio, validação no servidor e isolamento por funcionário.
Quotas, licença, volume, tamanho máximo do PDF e desempenho devem ser medidos/definidos no ambiente novo. Não prometer armazenamento ilimitado ou custo zero sem verificar o contrato existente.
Sem dados salariais em planilhas/logs; sem segredos no navegador/repositório. Aprovação interna de RH e segurança/privacidade antes de produção.

## Fora do escopo

Gerar/calcular folha, controlar ponto, criar contas/licenças Workspace, integrar ERP, autenticação externa e assinatura eletrônica. Holerites complementares dependem de decisão que amplie o modelo de tipo/versão; não presumir suporte.
