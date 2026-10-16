# Lógica do sistema: contratos e fluxos

Este arquivo descreve comportamento esperado, não implementação pronta. Toda decisão de acesso ocorre no backend.

## 1. Entrada do funcionário

Receber visita -> obter e-mail da sessão -> negar se vazio ou domínio inválido -> encontrar índice confiável da identidade -> conferir destinatário, funcionario_id, situação, validade e integridade -> retornar somente perfil mínimo e documentos autorizados.
Não consultar a planilha RH pela identidade do funcionário. Não usar e-mail/ID enviado pelo navegador como prova de identidade. Índice ausente, inválido ou ambíguo não libera acesso.

## 2. Consulta e abertura

Filtrar apenas documentos autorizados por ano/competência; devolver lista ordenada e estados claros. Para cada pedido de PDF, revalidar identidade, índice e pertinência do arquivo à lista; Drive aplica sua ACL ao link final. Não criar função que devolve qualquer arquivo a partir de um ID arbitrário.
Não confundir Visualizar com Baixar. Testar links, PDFs e permissão nas duas ações, incluindo acesso direto fora do portal.

## 3. Cadastro RH

Autorizar RH -> receber nome/e-mail/setor -> validar domínio, unicidade e limites -> abrir/reservar operação -> gerar candidato a funcionario_id e conferir duplicidade sob bloqueio -> persistir reserva -> criar pasta individual -> atribuir leitura à conta correta -> persistir cadastro -> publicar índice e associação confiável -> verificar resultados -> auditar e concluir.
O ID não é digitado. RH distingue homônimos por nome + e-mail. Se uma fase falhar, registrar PARCIAL e retomar com os mesmos IDs, sem criar outro cadastro/pasta automaticamente.

## 4. Upload

Autorizar RH -> validar operacao_id e dados -> buscar cadastro por funcionario_id e verificar situação -> obter pasta do cadastro -> validar competência e PDF/tamanho -> conferir duplicidade dentro do bloqueio -> salvar arquivo com rastreio da operação -> registrar Holerites -> publicar índice -> verificar permissão/resultado -> auditar -> concluir.
O cliente não escolhe livremente pasta ou responsável. Validação por extensão/MIME/assinatura básica não atesta ausência de malware. Tamanho permitido será configurado após testes.
Se o PDF foi salvo mas o índice falhou, devolver resultado parcial explícito e permitir retomar publicação sem novo upload duplicado.

## 5. Edição

Autorizar RH, verificar revisão e validar campos permitidos. Nome/setor: salvar, incrementar revisão, republicar índice e auditar. E-mail: operação sensível; preservar funcionario_id, validar nova identidade, revogar associação/acesso antigo, conceder acesso correto, republicar e verificar. Falha de revogação não é sucesso.
Não oferecer edição comum de funcionario_id. Não transferir cadastro entre pessoas só porque um e-mail foi reaproveitado.

## 6. Desativação

Autorizar RH -> confirmar destinatário -> registrar pedido -> marcar inativo/bloquear publicação -> revogar permissões do índice, pasta e PDFs -> conferir grupos, heranças e permissões diretas -> verificar ausência de acesso -> auditar.
Marcar SIM/NAO na planilha não revoga Drive. Heranças amplas que o sistema não pode corrigir geram pendência e orientação administrativa. Não apagar PDFs automaticamente. Cópias já baixadas não podem ser recolhidas pelo portal.

## 7. Correção de documento

Autorizar RH -> selecionar documento -> exigir confirmação -> impedir sua listagem ativa -> arquivar em área restrita -> conferir/revogar permissões que persistem -> atualizar registro e índice -> auditar. Enviar documento correto em operação controlada, respeitando a regra de duplicidade e a política de retenção. Não sobrescrever ou excluir sem registro.

## 8. Concorrência, erros e retorno

Todas as escritas pelo mesmo serviço administrativo. Bloqueio protege verificação/reserva e revisão previne sobrescrita. Não manter bloqueios por longos períodos sem necessidade; definir fases e reservas para continuidade.
Pedido repetido com mesmo ID e mesmos dados retoma ou devolve o resultado existente; com dados diferentes é rejeitado. Drive/Sheets não são transacionais: nunca devolver sucesso completo antes de verificar todas as fases necessárias.
Contrato conceitual de resposta: resultado (SUCESSO, PARCIAL ou ERRO), operacao_id quando aplicável, código seguro, mensagem e indicação de retomada. Não expor stack trace, dados de terceiros ou segredos ao usuário.
