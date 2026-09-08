-- AlterTable
ALTER TABLE "products" ADD COLUMN     "columns" TEXT,
ADD COLUMN     "compatibleBrowsers" TEXT[],
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "filesIncluded" TEXT[],
ADD COLUMN     "highResolution" TEXT,
ADD COLUMN     "minSoftwareVersion" TEXT,
ADD COLUMN     "retinaReady" TEXT,
ADD COLUMN     "tags" TEXT;
