# Decisões e pendências

Data da consolidação: 15/10/2026. Estas decisões pertencem ao projeto novo.

## Confirmado pelo usuário

D01. Construir do zero, sem reaproveitar código/configurações do protótipo.
D02. Manter HTML/CSS/JavaScript e Apps Script, com Workspace, Drive, Sheets e Sites.
D03. Retirar matrícula e manter funcionario_id interno automático, completo e permanente.
D04. Login pela identidade Google corporativa; mudança de e-mail não muda o ID interno.
D05. Desenvolver uma etapa por vez, testar, documentar e aguardar autorização para avançar.

## Propostas para validar na Etapa 01

P01. Dois aplicativos separados, executados como visitante; planilha privada e índice individual confiável.
P02. Drive compartilhado RH com compartilhamento individual interno e sem acesso geral dos funcionários.
P03. UUID gerado no servidor com verificação de duplicidade sob bloqueio e reserva por operação.
P04. Um holerite ativo por funcionário/competência; complementar exige ampliação aprovada.
P05. Arquivamento restrito para correção; nenhuma exclusão automática.

## Pendências do novo ambiente

Domínio/licença/armazenamento; contas A/B/RH; políticas de OAuth e Drive; modelo de associação/assinatura e validade dos índices; tamanho máximo PDF; retenção; responsáveis por homologação, suporte e recuperação; regra para recontratação/complementares.
Não copiar configurações do protótipo como se estivessem confirmadas. Registrar decisão, motivo, responsável, data e evidência quando resolver cada item.

## 15/10/2026 - Orientações da sessão

D06. O usuário esclareceu que docs/design.md é somente referência visual para o frontend. Regras funcionais seguem a documentação inicial e as decisões vigentes: sem matrícula e sem senha própria.
D07. Usuário autorizou iniciar pela Etapa 01 e usar agentes especializados em ambiente Google, frontend, backend/lógica e segurança. Especialistas atuarão no escopo de cada etapa; isso não autoriza implementar etapas futuras.
D08. PDF Portal_do_Colaborador_Documentacao_Novo_Projeto.pdf lido integralmente como documentação inicial do projeto.

## Continuidade autorizada - Etapa 02

D09. Usuário autorizou fechar preparação do piloto e iniciar autenticação. Etapa 01 concluída somente para piloto, conforme relatos de execução manual e limites apresentados.
D10. Etapa 02 limitada à identidade corporativa no servidor e listas explícitas de contas de teste e RH. Sem Drive/Sheets nem funcionalidades administrativas. Configuração de autorização fica em Script Properties, restrita a editores aprovados; configuração ausente/inválida nega acesso.
D11. Comparação das identidades ativa/efetiva é defesa adicional. Não comprova execução como visitante ao testar somente com implantador; testes com contas comuns continuam obrigatórios.

D12. Usuário solicitou organizar o projeto diretamente na raiz e manter commits/push para viniciuslopes-dev1/Portal_Do_Colaborador. Aplicativos em colaborador/ e rh/; documentação em docs/; referências em docs/referencias/; testes em tests/.

D13. Etapa 02 concluída com testes locais e confirmações manuais explícitas de acesso, negação, revogação e implantação. Não representa validação das integrações futuras ou produção. Etapa 03 permanece sujeita a autorização.

D14. Usuário autorizou Etapa 03. Apenas interface com dados fictícios, preservando autenticação, sem operações de etapas futuras. Nome/setor demonstrativos não serão apresentados como dados reais da conta; ações de documentos ainda indisponíveis serão explicitadas.

D15. Usuário validou a Etapa 03 e autorizou Etapa 04. Associação privada manual conta→pasta→documentos somente para PDFs fictícios de teste; não é cadastro nem publicação de índices. Fonte final/cadastro por funcionario_id permanecem para Etapa 05. Apenas portal recebe Drive em leitura; RH não muda.

D16. Etapa 04 concluída por confirmação manual do usuário, incluindo download, isolamento cruzado A/B e revogação de link antigo no Drive. Próxima etapa 05 depende de autorização explícita; mapa temporário não passa a ser cadastro operacional por esse aceite.

## Etapa 05 autorizada - 16/10/2026

D17. Usuário autorizou Etapa 05 após conclusão da Etapa 04. Cadastro e persistência backend entram nesta etapa; painel RH operacional permanece para Etapa 06.
D18. Fonte confiável: Drive compartilhado fixado em INDICES_DRIVE_ID, com escrita EXCLUSIVA de RH/técnicos aprovados em toda a árvore. Nome do JSON só permite descoberta; validar localização, destinatário, parentesco, esquema, capacidade de edição, versão estável e validade. Cópias fora da origem não autorizam. Premissa de escrita exclusiva precisa de confirmação manual; driveId isolado não atesta autoria.
D19. Índice fixo por pessoa, atualizado no mesmo arquivo, validade máxima de 24 horas e renovação manual pelo RH nesta etapa. Sem fallback ao mapa/allowlist de colaboradores da Etapa 04, sem cache de autorização e sem gatilhos automáticos.
D20. funcionario_id é UUID completo gerado no servidor, com colisões verificadas inclusive nas reservas sob ScriptLock. Operações preservam ID/recursos em retomadas; falha incerta de criação não recria às cegas. Hashes de pedidos são controle de repetição, não assinatura de índices.
D21. Planilha só RH explícito; novo consentimento RH Drive completo + Sheets para criar/publicar/compartilhar e persistir. Portal mantém somente e-mail e Drive readonly. Não executar como proprietário.
D22. Cadastro piloto cria novas pastas FUNC_uuid. Associar um PDF fictício por A/B por cópia manual e registro guiado; nenhuma exclusão ou migração automática dos arquivos da Etapa 04. Inativação e troca de e-mail com revogação integrada ficam para Etapa 06.

D23. A pedido do usuário, criada documentação explicativa em PDF para o projeto e suas oito etapas. Preservar o PDF inicial como referência histórica; manter os novos PDFs em docs/referencias/atualizada/ e a fonte em docs/GUIA_DO_PROJETO_E_ETAPAS.md. Documentação de 06 a 08 é planejamento e não autoriza iniciar essas etapas. O gerador local Python não integra os aplicativos Apps Script.
