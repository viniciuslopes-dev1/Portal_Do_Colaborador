# Regras obrigatórias de segurança

- Autenticação Google corporativa; sem senha própria. Identidade obtida no servidor; identidade indisponível implica negação.
- Autorizar todas as chamadas, inclusive chamadas diretas às funções RH. Membro do domínio não é automaticamente RH.
- Não compartilhar planilha ou raiz RH com funcionários; nenhuma opção pública ou acesso geral ao domínio aos holerites.
- Drive oferece proteção adicional: testar isolamento A/B diretamente em links, pastas e PDFs.
- Índice deve ser confiável, destinado à identidade correta, íntegro, válido e não ambíguo. Sem confiança apenas pelo nome de arquivo.
- UUID/IDs são referências, não senhas nem prova de acesso. Não expor endpoint de arquivo arbitrário.
- Validar entradas e referências no servidor. Renderizar texto sem injetar HTML; impedir fórmulas indevidas em Sheets.
- Segredos apenas em configuração privada; acesso restrito a editores dos projetos. Nunca frontend, Git, chat, planilha de auditoria ou documentação.
- Escopos OAuth mínimos compatíveis com APIs utilizadas e revisão no ambiente real. Autorização OAuth não compartilha planilha privada.
- Desativação/mudança de identidade exige atualização e revogação verificadas no Drive, inclusive permissões herdadas, diretas e grupos.
- Definir validade de índice, política de atualização e ação em falha. Não anunciar revogação instantânea apenas pela alteração central.
- Auditoria sem salários/conteúdo PDF e sem alegação de imutabilidade de uma planilha editável.
- Retenção/exclusão, backup/recuperação e resposta a incidentes precisam de responsáveis e aprovação interna. Não declarar conformidade LGPD só pela arquitetura.
- Teste e produção separados; só dados fictícios até homologação. Testar restauração e permissões antes de reabrir acesso.

Checklist integrado: [testes](../tests/CHECKLIST.md). Recursos e políticas de compartilhamento dependem de validação do Workspace. Não contornar restrição usando identidade privilegiada ou abertura da pasta principal.

## Controles implementados na Etapa 05

Fonte do índice restrita por INDICES_DRIVE_ID e premissa obrigatória de escrita exclusiva RH/admin em toda a árvore. Localização/canEdit não provam autoria isoladamente: conferir também concessões diretas em descendentes. Cópia Meu Drive é ignorada. Sem assinatura, fallback ao mapa antigo, cache autorizativo ou serviço executado como proprietário.

Gate exige índice ativo, destinatário exato, esquema fechado, validade de 24h e versão estável; ambiguidade nega. Planilha permanece privada e não é consultada pelo portal. RH confere ACL dos recursos antes de publicar, valida campos e rejeita fórmulas, duplicidades e referências inválidas. Cada escrita exige RH explícito e ScriptLock.

Expiração/inatividade do índice impede novas chamadas do portal, mas não encerra leitura de PDFs por links previamente obtidos. Revogar Drive continua obrigatório. Etapa05 não implementa inativação nem transferência de conta; não usar edição isolada da planilha como revogação.

Revisão especializada e 93 testes simulados passaram; OAuth, media v3 real e isolamento Google ainda não homologados. Critérios manuais na Etapa05.
