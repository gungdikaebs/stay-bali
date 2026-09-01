-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'PAYMENT_FAILED', 'EXPIRED', 'CANCELLATION_REQUESTED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'CHECKED_IN', 'COMPLETED');

-- CreateTable
CREATE TABLE "holds" (
    "id" VARCHAR(30) NOT NULL,
    "quote_id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30),
    "guest_session_id" VARCHAR(64),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hold_nights" (
    "id" VARCHAR(30) NOT NULL,
    "hold_id" VARCHAR(30) NOT NULL,
    "room_type_id" VARCHAR(30) NOT NULL,
    "stay_date" DATE NOT NULL,

    CONSTRAINT "hold_nights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" VARCHAR(30) NOT NULL,
    "booking_code" VARCHAR(20) NOT NULL,
    "room_type_id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30),
    "checkin_date" DATE NOT NULL,
    "checkout_date" DATE NOT NULL,
    "adult_count" SMALLINT NOT NULL,
    "child_count" SMALLINT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "service_fee" INTEGER NOT NULL,
    "grand_total" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "special_request" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_nights" (
    "id" VARCHAR(30) NOT NULL,
    "booking_id" VARCHAR(30) NOT NULL,
    "room_type_id" VARCHAR(30) NOT NULL,
    "stay_date" DATE NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "booking_nights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" VARCHAR(30) NOT NULL,
    "booking_id" VARCHAR(30) NOT NULL,
    "previous_status" "BookingStatus" NOT NULL,
    "next_status" "BookingStatus" NOT NULL,
    "actor_id" VARCHAR(30),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" VARCHAR(30) NOT NULL,
    "scope" VARCHAR(64) NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "actor_id" VARCHAR(30),
    "request" VARCHAR(64) NOT NULL,
    "result" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN "hold_id" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "holds_quote_id_key" ON "holds"("quote_id");

-- CreateIndex
CREATE INDEX "holds_user_id_expires_at_idx" ON "holds"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "holds_guest_session_id_expires_at_idx" ON "holds"("guest_session_id", "expires_at");

-- CreateIndex
CREATE INDEX "holds_quote_id_idx" ON "holds"("quote_id");

-- CreateIndex
CREATE INDEX "hold_nights_room_type_id_stay_date_idx" ON "hold_nights"("room_type_id", "stay_date");

-- CreateIndex
CREATE UNIQUE INDEX "hold_nights_hold_id_stay_date_key" ON "hold_nights"("hold_id", "stay_date");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_code_key" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "bookings_user_id_status_created_at_idx" ON "bookings"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_status_created_at_idx" ON "bookings"("status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_room_type_id_checkin_date_checkout_date_idx" ON "bookings"("room_type_id", "checkin_date", "checkout_date");

-- CreateIndex
CREATE INDEX "booking_nights_room_type_id_stay_date_idx" ON "booking_nights"("room_type_id", "stay_date");

-- CreateIndex
CREATE UNIQUE INDEX "booking_nights_booking_id_stay_date_key" ON "booking_nights"("booking_id", "stay_date");

-- CreateIndex
CREATE INDEX "booking_status_history_booking_id_created_at_idx" ON "booking_status_history"("booking_id", "created_at");

-- CreateIndex
CREATE INDEX "booking_status_history_actor_id_created_at_idx" ON "booking_status_history"("actor_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_scope_key_key" ON "idempotency_records"("scope", "key");

-- CreateIndex
CREATE INDEX "idempotency_records_scope_created_at_idx" ON "idempotency_records"("scope", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_hold_id_key" ON "quotes"("hold_id");

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_nights" ADD CONSTRAINT "hold_nights_hold_id_fkey" FOREIGN KEY ("hold_id") REFERENCES "holds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_nights" ADD CONSTRAINT "hold_nights_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_nights" ADD CONSTRAINT "booking_nights_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_nights" ADD CONSTRAINT "booking_nights_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_hold_id_fkey" FOREIGN KEY ("hold_id") REFERENCES "holds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
