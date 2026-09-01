-- Persist an absolute payment deadline so expiry jobs and payment callbacks use
-- the same source of truth. Manual and already-terminal bookings do not expire.
ALTER TABLE "bookings"
    ADD COLUMN "payment_expires_at" TIMESTAMP(3);

UPDATE "bookings"
SET "payment_expires_at" = "created_at" + INTERVAL '15 minutes'
WHERE "status" = 'PENDING_PAYMENT';

CREATE INDEX "bookings_status_payment_expires_at_idx"
    ON "bookings"("status", "payment_expires_at");
