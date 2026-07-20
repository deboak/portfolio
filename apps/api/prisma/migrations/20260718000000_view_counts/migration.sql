ALTER TABLE "Project" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "Project_published_viewCount_idx" ON "Project"("published", "viewCount" DESC);
CREATE INDEX "Post_published_viewCount_idx" ON "Post"("published", "viewCount" DESC);
