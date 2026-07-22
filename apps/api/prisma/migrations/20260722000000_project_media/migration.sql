ALTER TABLE "Project" ADD COLUMN "mediaAssetId" TEXT;

CREATE INDEX "Project_mediaAssetId_idx" ON "Project"("mediaAssetId");

ALTER TABLE "Project"
ADD CONSTRAINT "Project_mediaAssetId_fkey"
FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
