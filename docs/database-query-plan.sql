-- Run against a production-like dataset and save the plan before changing indexes.
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, title, slug, "publishedAt", "viewCount"
FROM "Post"
WHERE published = true
ORDER BY "publishedAt" DESC
LIMIT 20;

-- Expected supporting index: Post_published_publishedAt_idx.
-- Compare actual time, rows removed, buffer hits, and whether PostgreSQL chooses
-- an Index Scan before and after schema/index changes.
