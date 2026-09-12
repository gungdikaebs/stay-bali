CREATE TYPE "CancellationRequestType" AS ENUM ('STANDARD', 'POLICY_EXCEPTION', 'PARTNER_INITIATED');
CREATE TYPE "BookingSource" AS ENUM ('ONLINE', 'MANUAL');

ALTER TABLE "bookings"
    ADD COLUMN "cancellation_policy_version" VARCHAR(40) NOT NULL DEFAULT 'GLOBAL_3_DAY_V1',
    ADD COLUMN "free_cancellation_until" DATE,
    ADD COLUMN "refund_amount_before_deadline" INTEGER,
    ADD COLUMN "refund_amount_after_deadline" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "source" "BookingSource" NOT NULL DEFAULT 'ONLINE';

UPDATE "bookings"
SET
    "free_cancellation_until" = "checkin_date" - INTERVAL '3 days',
    "refund_amount_before_deadline" = "grand_total",
    "source" = CASE WHEN "user_id" IS NULL THEN 'MANUAL'::"BookingSource" ELSE 'ONLINE'::"BookingSource" END;

ALTER TABLE "bookings"
    ALTER COLUMN "free_cancellation_until" SET NOT NULL,
    ALTER COLUMN "refund_amount_before_deadline" SET NOT NULL;

ALTER TABLE "cancellation_requests"
    ADD COLUMN "type" "CancellationRequestType" NOT NULL DEFAULT 'POLICY_EXCEPTION';

ALTER TABLE "refund_records"
    ALTER COLUMN "processed_by_id" DROP NOT NULL;

CREATE INDEX "cancellation_requests_type_status_created_at_idx"
    ON "cancellation_requests"("type", "status", "created_at");
