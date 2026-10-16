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
