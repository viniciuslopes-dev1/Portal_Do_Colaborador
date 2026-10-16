# AGENTS.md - regras do projeto real

## Objetivo e contexto

Construir do zero um Portal do Colaborador corporativo para 31 a 100 funcionários, com entrada pelo Google Sites, conta Google Workspace e PDFs no Drive. Ler README.md, docs/DECISOES.md, docs/PROGRESSO.md e docs/HISTORICO.md ao começar uma sessão. Depois ler os documentos relevantes para a tarefa.
Esta base é independente do protótipo. Não copiar código, IDs, credenciais, configurações, resultados de testes ou status de etapas de projetos anteriores.

## Decisões obrigatórias

- Não existe matrícula no cadastro, nos formulários, no painel ou nos relacionamentos do novo projeto.
- Usar funcionario_id completo, automático, imutável, criado e conferido no servidor. Não usar número da linha, nome ou e-mail como chave primária.
- E-mail corporativo obtido no servidor identifica o login. O navegador não determina quem é o usuário.
- Tecnologias: HTML, CSS e JavaScript; Apps Script para backend; Drive para PDFs; Sheets privado para cadastro; Google Sites como entrada.
- Dois projetos separados: portal do funcionário e painel RH. Preferir execução como usuário que acessa, validada no ambiente real.
- Funcionário não acessa planilha administrativa. Usar índice individual confiável, conforme arquitetura e validação da Etapa 01.
- Não executar como proprietário nem compartilhar planilha/raiz com todos para contornar erros de permissão.
- Autorizar toda operação no backend; autorização RH exige contas explicitamente aprovadas.
- Não criar autenticação própria por senha, links públicos ou serviços pagos sem discutir previamente.

## Método de trabalho

Trabalhar somente uma etapa de cada vez. Antes de implementar: explicar objetivo, arquivos, pré-requisitos e o que mudará. Ensinar de forma simples, agrupando instruções para evitar passos excessivamente fragmentados. Explicar conceitos e caminhos nos serviços Google quando necessários.
Implementar apenas o escopo autorizado. Testar, registrar resultados reais e pedir confirmação dos testes manuais. Nunca interpretar silêncio como autorização. Não marcar CONCLUIDA antes de cumprir critérios e receber confirmação necessária. Não avançar para outra etapa sem autorização explícita.
Criar docs/etapas/ETAPA_XX.md ao trabalhar em cada etapa usando o modelo. Atualizar README.md, docs/PROGRESSO.md, docs/HISTORICO.md, docs/DECISOES.md e docs/ARQUITETURA.md conforme mudanças. Distinguir proposto, implementado e validado.
Não criar agora código ou telas de etapas futuras apenas porque os requisitos estão documentados.

## Segurança e validação

Seguir docs/SEGURANCA.md e tests/CHECKLIST.md. Testar com dados fictícios e contas A/B/RH. Testes simulados não comprovam OAuth, identidade, compartilhamento ou quotas reais.
Consultar documentação oficial Google para configurações e comportamentos atuais. Se a identidade estiver vazia, negar acesso. Validar IDs e referências; UUID não é autorização. Inativar exige revisar/revogar Drive, além de cadastro/índice.
Não registrar salários, conteúdo de PDFs, tokens ou chaves em logs, documentação ou repositório. Não apagar arquivos/dados sem autorização. Respeitar retenção definida pelo RH e responsáveis por privacidade.

## Continuidade e início

Preservar decisões, pendências, evidências e próxima ação nos documentos. Perguntar apenas o que falta, sem repetir dados confirmados. Na primeira execução, começar exclusivamente pela Etapa 01: conferir ambiente e arquitetura; não desenvolver o sistema inteiro.

## Organização e versionamento

A raiz deste repositório é a pasta de trabalho, sem a antiga subpasta portal-colaborador. Manter colaborador/ e rh/ como aplicativos independentes, docs/ para documentação, docs/etapas/ para registros e docs/referencias/ para documentos de origem. Código novo deve seguir a estrutura e o escopo da etapa.

O usuário autorizou commits e push contínuos para https://github.com/viniciuslopes-dev1/Portal_Do_Colaborador.git. Fazer commits por conjunto coerente de mudanças verificadas e publicar o progresso; conferir arquivos staged antes de cada commit. Não versionar segredos, configurações privadas, holerites reais ou dados pessoais de produção. Não reescrever histórico remoto nem usar force push sem autorização específica.
