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
