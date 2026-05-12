package com.dumply.repository;

import com.dumply.model.ConsentLog;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositório append-only para a entidade {@link ConsentLog}.
 *
 * <p>Diferentemente dos demais repositórios do projeto, esta interface estende
 * apenas {@link Repository} (e não {@link org.springframework.data.jpa.repository.JpaRepository}),
 * expondo deliberadamente <b>somente os métodos de inserção e leitura</b>.
 * Não há métodos {@code delete*}, {@code deleteAll}, {@code save} em modo upsert,
 * nem qualquer rota para alteração de registros existentes.</p>
 *
 * <p>Essa restrição é proposital e atende:
 * <ul>
 *   <li>Req. 4.7 — Registro imutável de data e versão do consentimento;</li>
 *   <li>Req. 5.3 — Proteção contra alteração dos logs (no nível de aplicação);</li>
 *   <li>Art. 6º, X da LGPD — Princípio da prestação de contas.</li>
 * </ul>
 * Recomenda-se reforçar essa garantia também no nível do banco de dados,
 * por meio de revogação de privilégios de UPDATE/DELETE para o usuário
 * de aplicação na tabela {@code consent_log}.</p>
 */
public interface ConsentLogRepository extends Repository<ConsentLog, UUID> {

    /**
     * Persiste um novo evento de consentimento. Como a entidade utiliza UUID
     * gerado pelo provider JPA, toda chamada a {@code save} resulta em INSERT.
     */
    ConsentLog save(ConsentLog consentLog);

    /**
     * Recupera o histórico completo de manifestações de um titular,
     * ordenado da mais recente para a mais antiga.
     * Utilizado pelo endpoint {@code GET /lgpd/me/export} (Req. 4.9).
     */
    List<ConsentLog> findByUserIdOrderByTimestampDesc(UUID userId);

    /**
     * Recupera as manifestações de um titular para uma finalidade específica.
     * Utilizado para determinar o estado atual do consentimento por finalidade.
     */
    List<ConsentLog> findByUserIdAndPurposeOrderByTimestampDesc(UUID userId, String purpose);
}
