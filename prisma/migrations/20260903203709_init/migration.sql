-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'DM');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PARTY', 'PRIVATE', 'DM_ONLY');

-- CreateEnum
CREATE TYPE "CharacterKind" AS ENUM ('PC', 'NPC');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('NONE', 'HALF', 'PROFICIENT', 'EXPERTISE');

-- CreateEnum
CREATE TYPE "ProficiencyKind" AS ENUM ('WEAPON', 'ARMOR', 'TOOL', 'LANGUAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeatureSource" AS ENUM ('CLASS', 'SUBCLASS', 'RACE', 'BACKGROUND', 'FEAT', 'ITEM', 'OTHER');

-- CreateEnum
CREATE TYPE "RechargeOn" AS ENUM ('NONE', 'SHORT_REST', 'LONG_REST', 'DAWN');

-- CreateEnum
CREATE TYPE "SlotKind" AS ENUM ('STANDARD', 'PACT');

-- CreateEnum
CREATE TYPE "SpellSource" AS ENUM ('CLASS', 'RACE', 'ITEM', 'FEAT');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('WEAPON', 'ARMOR', 'SHIELD', 'AMMUNITION', 'POTION', 'SCROLL', 'WAND', 'ROD', 'RING', 'WONDROUS', 'TOOL', 'GEAR', 'TREASURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ItemRarity" AS ENUM ('NONE', 'COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY', 'ARTIFACT', 'VARIES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "CharacterKind" NOT NULL DEFAULT 'PC',
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "campaignId" TEXT,
    "raceIndex" TEXT,
    "raceLabel" TEXT,
    "subraceIndex" TEXT,
    "subraceLabel" TEXT,
    "backgroundIndex" TEXT,
    "backgroundLabel" TEXT,
    "alignmentIndex" TEXT,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "initiativeMisc" INTEGER NOT NULL DEFAULT 0,
    "speedFt" INTEGER NOT NULL DEFAULT 30,
    "proficiencyBonusOverride" INTEGER,
    "passivePerceptionOverride" INTEGER,
    "hpMax" INTEGER NOT NULL DEFAULT 1,
    "hpCurrent" INTEGER NOT NULL DEFAULT 1,
    "hpTemp" INTEGER NOT NULL DEFAULT 0,
    "savingThrowProficiencies" TEXT[],
    "deathSaveSuccesses" INTEGER NOT NULL DEFAULT 0,
    "deathSaveFailures" INTEGER NOT NULL DEFAULT 0,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "conditions" TEXT[],
    "exhaustionLevel" INTEGER NOT NULL DEFAULT 0,
    "spellcastingAbility" TEXT,
    "spellSaveDcOverride" INTEGER,
    "spellAttackOverride" INTEGER,
    "copper" INTEGER NOT NULL DEFAULT 0,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "electrum" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "platinum" INTEGER NOT NULL DEFAULT 0,
    "portraitUrl" TEXT,
    "portraitAlt" TEXT,
    "portraitWidth" INTEGER,
    "portraitHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterClass" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "classIndex" TEXT NOT NULL,
    "classLabel" TEXT NOT NULL,
    "subclassIndex" TEXT,
    "subclassLabel" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "hitDieSize" INTEGER NOT NULL,
    "hitDiceUsed" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillIndex" TEXT NOT NULL,
    "proficiency" "ProficiencyLevel" NOT NULL DEFAULT 'PROFICIENT',
    "miscBonus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterProficiency" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "kind" "ProficiencyKind" NOT NULL,
    "srdIndex" TEXT,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterFeature" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" "FeatureSource" NOT NULL DEFAULT 'CLASS',
    "levelAcquired" INTEGER,
    "srdIndex" TEXT,
    "srdSnapshot" JSONB,
    "usesMax" INTEGER,
    "usesUsed" INTEGER NOT NULL DEFAULT 0,
    "rechargeOn" "RechargeOn" NOT NULL DEFAULT 'NONE',
    "visibility" "Visibility" NOT NULL DEFAULT 'PARTY',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpellSlot" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "kind" "SlotKind" NOT NULL DEFAULT 'STANDARD',
    "level" INTEGER NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 0,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpellSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSpell" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT,
    "isPrepared" BOOLEAN NOT NULL DEFAULT false,
    "alwaysPrepared" BOOLEAN NOT NULL DEFAULT false,
    "source" "SpellSource" NOT NULL DEFAULT 'CLASS',
    "classIndex" TEXT,
    "notes" TEXT,
    "srdSnapshot" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterSpell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL DEFAULT 'GEAR',
    "rarity" "ItemRarity" NOT NULL DEFAULT 'NONE',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weightLb" DECIMAL(8,2),
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "requiresAttunement" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "chargesMax" INTEGER,
    "chargesUsed" INTEGER,
    "description" TEXT,
    "srdSnapshot" JSONB,
    "visibility" "Visibility" NOT NULL DEFAULT 'PARTY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterBio" (
    "characterId" TEXT NOT NULL,
    "backstory" TEXT,
    "personalityTraits" TEXT,
    "ideals" TEXT,
    "bonds" TEXT,
    "flaws" TEXT,
    "appearance" TEXT,
    "alliesOrganizations" TEXT,
    "age" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "eyes" TEXT,
    "skin" TEXT,
    "hair" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterBio_pkey" PRIMARY KEY ("characterId")
);

-- CreateTable
CREATE TABLE "CharacterNote" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");

-- CreateIndex
CREATE INDEX "Character_campaignId_idx" ON "Character"("campaignId");

-- CreateIndex
CREATE INDEX "Character_ownerId_idx" ON "Character"("ownerId");

-- CreateIndex
CREATE INDEX "CharacterClass_characterId_idx" ON "CharacterClass"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_characterId_classIndex_key" ON "CharacterClass"("characterId", "classIndex");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkill_characterId_skillIndex_key" ON "CharacterSkill"("characterId", "skillIndex");

-- CreateIndex
CREATE INDEX "CharacterProficiency_characterId_kind_idx" ON "CharacterProficiency"("characterId", "kind");

-- CreateIndex
CREATE INDEX "CharacterFeature_characterId_idx" ON "CharacterFeature"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "SpellSlot_characterId_kind_level_key" ON "SpellSlot"("characterId", "kind", "level");

-- CreateIndex
CREATE INDEX "CharacterSpell_characterId_level_idx" ON "CharacterSpell"("characterId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSpell_characterId_srdIndex_source_key" ON "CharacterSpell"("characterId", "srdIndex", "source");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE INDEX "CharacterNote_characterId_visibility_idx" ON "CharacterNote"("characterId", "visibility");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterClass" ADD CONSTRAINT "CharacterClass_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkill" ADD CONSTRAINT "CharacterSkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterProficiency" ADD CONSTRAINT "CharacterProficiency_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterFeature" ADD CONSTRAINT "CharacterFeature_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellSlot" ADD CONSTRAINT "SpellSlot_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpell" ADD CONSTRAINT "CharacterSpell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterBio" ADD CONSTRAINT "CharacterBio_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterNote" ADD CONSTRAINT "CharacterNote_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterNote" ADD CONSTRAINT "CharacterNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
