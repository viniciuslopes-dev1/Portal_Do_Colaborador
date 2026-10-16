# Arquitetura do novo projeto

## Componentes

Google Sites -> portal do funcionário -> Apps Script do funcionário -> índice individual confiável + PDFs permitidos no Drive.
RH autorizado -> Apps Script RH -> Sheets privado + gestão do Drive + publicação dos índices + auditoria.

HTML estrutura as telas; CSS define apresentação; JavaScript no navegador cuida da interação. JavaScript em arquivos .gs roda no Apps Script e aplica regras de negócio. JSON transporta dados; Markdown documenta.

## Separação de permissões

Dois projetos Apps Script e manifestos independentes, preferencialmente executados como o visitante. O RH usa sua identidade autorizada para acessar a planilha e administrar arquivos. O funcionário usa sua identidade para ler apenas os recursos individuais permitidos. Não disponibilizar a planilha central aos funcionários.

## Índice individual

Publicação mínima do perfil e dos documentos do funcionário: funcionario_id, e-mail destinatário, situação, perfil necessário, pasta_id e referências dos holerites, além de versão e validade. Não conter dados de terceiros, salários ou segredos.
A associação entre identidade e índice é feita pelo servidor. Para piloto, considerar mapeamento privado e controlado de e-mail para índice. Na operação final, o RH deverá atualizar essa associação automaticamente.
Não buscar um JSON apenas pelo nome e confiar nele. Se a descoberta permitir encontrar arquivos não confiáveis, verificar assinatura e todas as referências antes de aceitar. HMAC é alternativa a detalhar, não mecanismo já homologado. Exige chave apenas nos servidores, rotação e controle de editores; assinatura não criptografa nem resolve expiração/revogação.
Definir validade, atualização e falha fechada para índice vencido. Dados publicados podem estar desatualizados; desativação urgente exige revogação de Drive/identidade, não apenas editar Sheets.

## Armazenamento

Drive RH privado / Holerites / FUNC_<funcionario_id> / PDFs e índice individual.
Área administrativa privada / planilha central e auditoria.
Arquivo restrito RH / documentos substituídos conforme retenção.
Funcionário não será participante geral do Drive RH. Compartilhamento individual com usuários internos não participantes depende de licença/políticas e deve ser testado. A pasta raiz continua privada.

## Limites

Serviços não oferecem transação única Drive/Sheets; operações precisam de fases e retomada. Locks do script não impedem edição manual nem coordenam automaticamente projetos diferentes. Centralizar escritas no aplicativo RH.
O modelo de associação/assinatura e o uso de Drive compartilhado são propostas a validar na Etapa 01 antes de programar a integração.

## Revisão da Etapa 01 em andamento

Arquitetura acima permanece proposta, sem homologação no Workspace. Revisões especializadas de ambiente, backend/lógica e segurança iniciadas. Domínio, licença, contas A/B/RH, tipo de Drive, associação confiável entre projetos, validade dos índices e revogação efetiva ainda precisam de evidência. Nenhum recurso remoto criado nesta sessão.

### Associação entre os projetos

Script Properties não são compartilhadas entre projetos. Associação manual privada no portal é proposta para o piloto; automatização pelo RH exige canal explícito ainda a escolher e validar. Não presumir que o RH pode atualizar PropertiesService de outro projeto. Referência: https://developers.google.com/apps-script/guides/properties

### Escopo proposto para o piloto

Associação manual privada no servidor do portal, com IDs fixos e índices editáveis somente pelo RH. Proposta em revisão final; não representa homologação da operação final. Canal automático entre projetos, renovação/validade e fonte da versão vigente deverão estar resolvidos antes de integrar publicação operacional nas etapas 05/06. Etapa 02 não depende de Drive ou Sheets: valida apenas identidade e autorização RH.

## Etapa 02 - fronteira de autenticação

Preparação do piloto aprovada pelo usuário para continuidade. Dois aplicativos independentes com execução como visitante e acesso limitado à organização. Backend obtém Session ativa/efetiva, exige domínio exato e lista explícita configurada no respectivo projeto. Cada chamada pública revalida autorização; não usar identidade fornecida pelo navegador. Comparação de sessão não substitui inspeção da implantação e testes com usuários não proprietários. Autorização por lista de piloto ainda não é validação do cadastro ativo/índice. Nenhuma integração Drive/Sheets nesta etapa.

Etapa 02 implementada localmente: Code.gs independente por projeto, contendo backend e diagnóstico HTML inline. Apenas doGet/obterSessao públicos, autorização reavaliada em ambos. Listas piloto PILOTO_COLABORADORES_EMAILS/PILOTO_RH_EMAILS independentes; validação integral e negação em falha. Revisão de segurança e 34 testes simulados aprovados; execução real/OAuth pendentes.

## Autenticação piloto confirmada

Usuário confirmou identidade/acessos A/B/RH, bloqueios fora das listas e externos, reautorização após remoção e opções de implantação/consentimento. Etapa 02 concluída no piloto por relatos manuais; sem inspeção remota independente. Associação por índice/cadastro e acesso a documentos continuam não implementados.

## Interface da Etapa 03

HTML separado por aplicativo em Index/Styles/Scripts, com templates montados apenas após autorização no doGet. Includes privados por allowlist, sem seleção por parâmetros externos. obterSessao mantém reautorização. Fixtures client-side são somente demonstração; não representam cadastro, documentos reais ou integração. Sem escopos adicionais.

## Etapa 04 - integração Drive do piloto

Associação temporária privada em Script Properties PILOTO_DRIVE_MAPA fixa conta/pasta/documentos fictícios. Fonte atual é a configuração administrativa, reavaliada em cada chamada; não usa JSON descoberto pelo nome, não acessa planilha RH nem cria índice automático. Drive API v3 no portal, supportsAllDrives e drive.readonly. Antes de retornar links, reautorizar sessão, verificar referência na própria lista e metadados Drive (pasta direta, MIME PDF, sem lixeira/atalho). O Drive continua aplicando ACL no navegador. RH permanece com escopo só e-mail. Mapa manual não é arquitetura operacional final.

Etapa 04 entregue localmente: Drive.gs implementa listarHolerites/obterLinkHolerite, com referência própria antes de IO, metadados PDF/pasta/ACL e links somente retornados pela API. Lista não retorna URLs. Frontend deixa fixtures documentais e usa RPC, com controle de chamadas antigas, limpeza e nova autorização em cada tentativa. 72 testes com mocks e revisão independente concluídos; testes Google reais pendentes.
