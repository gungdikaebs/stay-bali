-- Portfolio payment simulator: preserve immutable attempt history without
-- storing card, bank, wallet, or other sensitive payment credentials.
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('SUCCEEDED', 'FAILED');

CREATE TABLE "payment_attempts" (
    "id" VARCHAR(30) NOT NULL,
    "booking_id" VARCHAR(30) NOT NULL,
    "actor_id" VARCHAR(30) NOT NULL,
    "idempotency_key" VARCHAR(64) NOT NULL,
    "request_hash" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(30) NOT NULL DEFAULT 'DEMO',
    "provider_reference" VARCHAR(64) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "status" "PaymentAttemptStatus" NOT NULL,
    "failure_code" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payment_attempts_booking_id_fkey"
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_attempts_actor_id_fkey"
      FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "payment_attempts_provider_reference_key"
    ON "payment_attempts"("provider_reference");
CREATE UNIQUE INDEX "payment_attempts_booking_id_idempotency_key_key"
    ON "payment_attempts"("booking_id", "idempotency_key");
CREATE INDEX "payment_attempts_booking_id_created_at_idx"
    ON "payment_attempts"("booking_id", "created_at");
CREATE INDEX "payment_attempts_status_created_at_idx"
    ON "payment_attempts"("status", "created_at");
