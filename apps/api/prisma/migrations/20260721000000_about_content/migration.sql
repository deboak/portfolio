CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "eyebrow" TEXT NOT NULL DEFAULT 'About',
    "title" TEXT NOT NULL,
    "introTitle" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "valueOneTitle" TEXT NOT NULL,
    "valueOneText" TEXT NOT NULL,
    "valueTwoTitle" TEXT NOT NULL,
    "valueTwoText" TEXT NOT NULL,
    "valueThreeTitle" TEXT NOT NULL,
    "valueThreeText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);
