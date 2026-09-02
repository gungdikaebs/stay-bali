CREATE TYPE "CancellationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "cancellation_requests" (
    "id" VARCHAR(30) NOT NULL,
    "booking_id" VARCHAR(30) NOT NULL,
    "requester_id" VARCHAR(30) NOT NULL,
    "reason" TEXT NOT NULL,
    "eligible_for_full_refund" BOOLEAN NOT NULL,
    "requested_refund_amount" INTEGER NOT NULL,
    "status" "CancellationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "resolution_note" TEXT,
    "resolved_by_id" VARCHAR(30),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cancellation_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cancellation_requests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cancellation_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cancellation_requests_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cancellation_requests_refund_amount_check" CHECK ("requested_refund_amount" >= 0)
);

CREATE TABLE "refund_records" (
    "id" VARCHAR(30) NOT NULL,
    "booking_id" VARCHAR(30) NOT NULL,
    "cancellation_request_id" VARCHAR(30) NOT NULL,
    "processed_by_id" VARCHAR(30) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "reference" VARCHAR(64) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refund_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refund_records_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refund_records_cancellation_request_id_fkey" FOREIGN KEY ("cancellation_request_id") REFERENCES "cancellation_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refund_records_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refund_records_amount_check" CHECK ("amount" > 0),
    CONSTRAINT "refund_records_currency_check" CHECK ("currency" = 'IDR')
);

CREATE INDEX "cancellation_requests_booking_id_created_at_idx" ON "cancellation_requests"("booking_id", "created_at");
CREATE INDEX "cancellation_requests_status_created_at_idx" ON "cancellation_requests"("status", "created_at");
CREATE UNIQUE INDEX "refund_records_cancellation_request_id_key" ON "refund_records"("cancellation_request_id");
CREATE UNIQUE INDEX "refund_records_reference_key" ON "refund_records"("reference");
CREATE INDEX "refund_records_booking_id_created_at_idx" ON "refund_records"("booking_id", "created_at");
CREATE INDEX "refund_records_processed_by_id_created_at_idx" ON "refund_records"("processed_by_id", "created_at");
