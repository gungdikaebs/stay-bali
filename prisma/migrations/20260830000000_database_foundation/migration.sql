-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TRAVELER', 'PARTNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('VILLA', 'HOTEL', 'HOMESTAY');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'ORPHANED');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(30) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL DEFAULT 'TRAVELER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "session_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_credentials" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_profiles" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "business_name" VARCHAR(150) NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" VARCHAR(30) NOT NULL,
    "owner_partner_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "check_in_time" CHAR(5) NOT NULL DEFAULT '15:00',
    "check_out_time" CHAR(5) NOT NULL DEFAULT '11:00',
    "cancellation_policy" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_reviews" (
    "id" VARCHAR(30) NOT NULL,
    "property_id" VARCHAR(30) NOT NULL,
    "reviewer_id" VARCHAR(30) NOT NULL,
    "previous_state" "PropertyStatus" NOT NULL,
    "next_state" "PropertyStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" VARCHAR(30) NOT NULL,
    "property_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "adult_capacity" SMALLINT NOT NULL,
    "child_capacity" SMALLINT NOT NULL DEFAULT 0,
    "bed_type" VARCHAR(100) NOT NULL,
    "size_sqm" INTEGER,
    "base_price" INTEGER NOT NULL,
    "total_units" SMALLINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_facilities" (
    "property_id" VARCHAR(30) NOT NULL,
    "facility_id" VARCHAR(30) NOT NULL,

    CONSTRAINT "property_facilities_pkey" PRIMARY KEY ("property_id","facility_id")
);

-- CreateTable
CREATE TABLE "room_facilities" (
    "room_type_id" VARCHAR(30) NOT NULL,
    "facility_id" VARCHAR(30) NOT NULL,

    CONSTRAINT "room_facilities_pkey" PRIMARY KEY ("room_type_id","facility_id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" VARCHAR(30) NOT NULL,
    "uploaded_by_id" VARCHAR(30) NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PROCESSING',
    "original_key" VARCHAR(500) NOT NULL,
    "display_key" VARCHAR(500),
    "thumbnail_key" VARCHAR(500),
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "alt_text" VARCHAR(255),
    "orphaned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "property_id" VARCHAR(30) NOT NULL,
    "media_id" VARCHAR(30) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("property_id","media_id")
);

-- CreateTable
CREATE TABLE "room_media" (
    "room_type_id" VARCHAR(30) NOT NULL,
    "media_id" VARCHAR(30) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "room_media_pkey" PRIMARY KEY ("room_type_id","media_id")
);

-- CreateTable
CREATE TABLE "inventory_dates" (
    "id" VARCHAR(30) NOT NULL,
    "room_type_id" VARCHAR(30) NOT NULL,
    "stay_date" DATE NOT NULL,
    "price_override" INTEGER,
    "total_units_override" SMALLINT,
    "held_units" SMALLINT NOT NULL DEFAULT 0,
    "booked_units" SMALLINT NOT NULL DEFAULT 0,
    "stop_sell" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(30) NOT NULL,
    "actor_id" VARCHAR(30),
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Preserve the non-negative ranges previously enforced by MySQL UNSIGNED types.
ALTER TABLE "room_types"
    ADD CONSTRAINT "room_types_adult_capacity_unsigned" CHECK ("adult_capacity" BETWEEN 0 AND 255),
    ADD CONSTRAINT "room_types_child_capacity_unsigned" CHECK ("child_capacity" BETWEEN 0 AND 255),
    ADD CONSTRAINT "room_types_size_sqm_unsigned" CHECK ("size_sqm" IS NULL OR "size_sqm" BETWEEN 0 AND 65535),
    ADD CONSTRAINT "room_types_base_price_nonnegative" CHECK ("base_price" >= 0),
    ADD CONSTRAINT "room_types_total_units_unsigned" CHECK ("total_units" BETWEEN 0 AND 255);

ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_size_bytes_nonnegative" CHECK ("size_bytes" >= 0),
    ADD CONSTRAINT "media_assets_width_unsigned" CHECK ("width" BETWEEN 0 AND 65535),
    ADD CONSTRAINT "media_assets_height_unsigned" CHECK ("height" BETWEEN 0 AND 65535);

ALTER TABLE "property_media"
    ADD CONSTRAINT "property_media_sort_order_unsigned" CHECK ("sort_order" BETWEEN 0 AND 65535);

ALTER TABLE "room_media"
    ADD CONSTRAINT "room_media_sort_order_unsigned" CHECK ("sort_order" BETWEEN 0 AND 65535);

ALTER TABLE "inventory_dates"
    ADD CONSTRAINT "inventory_dates_price_override_nonnegative" CHECK ("price_override" IS NULL OR "price_override" >= 0),
    ADD CONSTRAINT "inventory_dates_total_units_override_unsigned" CHECK ("total_units_override" IS NULL OR "total_units_override" BETWEEN 0 AND 255),
    ADD CONSTRAINT "inventory_dates_held_units_unsigned" CHECK ("held_units" BETWEEN 0 AND 255),
    ADD CONSTRAINT "inventory_dates_booked_units_unsigned" CHECK ("booked_units" BETWEEN 0 AND 255);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "account_credentials_user_id_key" ON "account_credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_user_id_key" ON "partner_profiles"("user_id");

-- CreateIndex
CREATE INDEX "partner_profiles_status_idx" ON "partner_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE INDEX "properties_status_area_idx" ON "properties"("status", "area");

-- CreateIndex
CREATE INDEX "properties_owner_partner_id_status_idx" ON "properties"("owner_partner_id", "status");

-- CreateIndex
CREATE INDEX "property_reviews_property_id_created_at_idx" ON "property_reviews"("property_id", "created_at");

-- CreateIndex
CREATE INDEX "property_reviews_reviewer_id_created_at_idx" ON "property_reviews"("reviewer_id", "created_at");

-- CreateIndex
CREATE INDEX "room_types_property_id_is_active_idx" ON "room_types"("property_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_name_key" ON "facilities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_slug_key" ON "facilities"("slug");

-- CreateIndex
CREATE INDEX "property_facilities_facility_id_idx" ON "property_facilities"("facility_id");

-- CreateIndex
CREATE INDEX "room_facilities_facility_id_idx" ON "room_facilities"("facility_id");

-- CreateIndex
CREATE INDEX "media_assets_status_orphaned_at_idx" ON "media_assets"("status", "orphaned_at");

-- CreateIndex
CREATE INDEX "media_assets_uploaded_by_id_created_at_idx" ON "media_assets"("uploaded_by_id", "created_at");

-- CreateIndex
CREATE INDEX "property_media_property_id_sort_order_idx" ON "property_media"("property_id", "sort_order");

-- CreateIndex
CREATE INDEX "property_media_media_id_idx" ON "property_media"("media_id");

-- CreateIndex
CREATE INDEX "room_media_room_type_id_sort_order_idx" ON "room_media"("room_type_id", "sort_order");

-- CreateIndex
CREATE INDEX "room_media_media_id_idx" ON "room_media"("media_id");

-- CreateIndex
CREATE INDEX "inventory_dates_stay_date_stop_sell_idx" ON "inventory_dates"("stay_date", "stop_sell");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_dates_room_type_id_stay_date_key" ON "inventory_dates"("room_type_id", "stay_date");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- AddForeignKey
ALTER TABLE "account_credentials" ADD CONSTRAINT "account_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_partner_id_fkey" FOREIGN KEY ("owner_partner_id") REFERENCES "partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_reviews" ADD CONSTRAINT "property_reviews_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_reviews" ADD CONSTRAINT "property_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_facilities" ADD CONSTRAINT "property_facilities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_facilities" ADD CONSTRAINT "property_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_media" ADD CONSTRAINT "room_media_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_media" ADD CONSTRAINT "room_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_dates" ADD CONSTRAINT "inventory_dates_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
