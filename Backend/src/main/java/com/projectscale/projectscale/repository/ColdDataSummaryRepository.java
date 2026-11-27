package com.projectscale.projectscale.repository;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.projectscale.projectscale.dto.ColdDataSummaryPage;

@Repository
public class ColdDataSummaryRepository {
    private static final String PROFILE_NAME = """
            SELECT NULLIF(btrim(h.value ->> 'fullName'), '')
            FROM hot_items h
            WHERE h.user_id = u.id
              AND (h.item_key = 'QUICK_PROFILE' OR starts_with(h.item_key, 'QUICK_PROFILE_'))
              AND NULLIF(btrim(h.value ->> 'fullName'), '') IS NOT NULL
            ORDER BY h.updated_at DESC, h.id DESC
            LIMIT 1
            """;

    private static final String SUMMARY = """
            WITH matching_users AS (
                SELECT u.id, u.username
                FROM users u
                WHERE EXISTS (SELECT 1 FROM cold_items c WHERE c.user_id = u.id)
                  AND (:search = '' OR CASE WHEN :search ~ '^[0-9]+$'
                        THEN CAST(u.id AS text) = ltrim(:search, '0')
                        ELSE strpos(lower(u.username), lower(:search)) > 0
                             OR strpos(lower((%s)), lower(:search)) > 0
                       END)
            ), page_users AS (
                SELECT id, username
                FROM matching_users
                ORDER BY id
                LIMIT :size OFFSET :offset
            ), total AS (
                SELECT count(*) AS record_count FROM matching_users
            )
            SELECT u.id AS user_id,
                   COALESCE((%s), u.username) AS name,
                   NULLIF(concat_ws(', ', address.area, NULLIF(address.city, address.area)), '') AS locality,
                   education.qualification,
                   family.recorded_members,
                   total.record_count
            FROM total
            LEFT JOIN page_users u ON true
            LEFT JOIN LATERAL (
                SELECT NULLIF(btrim(c.payload ->> 'area'), '') AS area,
                       NULLIF(btrim(c.payload ->> 'city'), '') AS city
                FROM cold_items c
                WHERE c.user_id = u.id AND c.type = 'ADDRESS_RECORD'
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT 1
            ) address ON true
            LEFT JOIN LATERAL (
                SELECT NULLIF(btrim(c.payload ->> 'highestQualification'), '') AS qualification
                FROM cold_items c
                WHERE c.user_id = u.id AND c.type = 'EDUCATION_RECORD'
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT 1
            ) education ON true
            LEFT JOIN LATERAL (
                SELECT CASE WHEN jsonb_typeof(c.payload -> 'members') = 'array' THEN (
                    SELECT CAST(count(*) AS integer)
                    FROM jsonb_array_elements(c.payload -> 'members') AS member(value)
                    WHERE jsonb_typeof(member.value) = 'object'
                ) END AS recorded_members
                FROM cold_items c
                WHERE c.user_id = u.id AND c.type = 'FAMILY_RECORD'
                ORDER BY c.created_at DESC, c.id DESC
                LIMIT 1
            ) family ON true
            ORDER BY u.id
            """.formatted(PROFILE_NAME, PROFILE_NAME);

    private final NamedParameterJdbcTemplate jdbc;

    public ColdDataSummaryRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public ColdDataSummaryPage findSummaries(String search, int page, int size) {
        var parameters = Map.of("search", search, "size", size, "offset", (long) page * size);
        return jdbc.query(SUMMARY, parameters, result -> {
            var records = new ArrayList<ColdDataSummaryPage.Row>();
            long total = 0;
            while (result.next()) {
                total = result.getLong("record_count");
                Long userId = result.getObject("user_id", Long.class);
                if (userId != null) {
                    records.add(new ColdDataSummaryPage.Row(userId, result.getString("name"),
                            result.getString("locality"), result.getString("qualification"),
                            result.getObject("recorded_members", Integer.class)));
                }
            }
            return new ColdDataSummaryPage(records, page, size, total);
        });
    }
}
