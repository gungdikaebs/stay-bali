CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'DISPATCHED', 'FAILED');
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

CREATE TABLE "outbox_events" (
    "id" VARCHAR(30) NOT NULL,
    "event_key" VARCHAR(150) NOT NULL,
    "topic" VARCHAR(100) NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched_at" TIMESTAMP(3),
    "last_error" VARCHAR(1000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "outbox_events_attempts_check" CHECK ("attempts" >= 0)
);

CREATE TABLE "email_deliveries" (
    "id" VARCHAR(30) NOT NULL,
    "outbox_event_id" VARCHAR(30) NOT NULL,
    "recipient" VARCHAR(254) NOT NULL,
    "template" VARCHAR(100) NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "max_attempts" SMALLINT NOT NULL DEFAULT 5,
    "provider_message_id" VARCHAR(255),
    "last_error" VARCHAR(1000),
    "next_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "email_deliveries_attempts_check" CHECK ("attempts" >= 0),
    CONSTRAINT "email_deliveries_max_attempts_check" CHECK ("max_attempts" BETWEEN 1 AND 20),
    CONSTRAINT "email_deliveries_outbox_event_id_fkey" FOREIGN KEY ("outbox_event_id") REFERENCES "outbox_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "outbox_events_event_key_key" ON "outbox_events"("event_key");
CREATE INDEX "outbox_events_status_available_at_created_at_idx" ON "outbox_events"("status", "available_at", "created_at");
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_created_at_idx" ON "outbox_events"("aggregate_type", "aggregate_id", "created_at");
CREATE UNIQUE INDEX "email_deliveries_outbox_event_id_key" ON "email_deliveries"("outbox_event_id");
CREATE INDEX "email_deliveries_status_next_attempt_at_created_at_idx" ON "email_deliveries"("status", "next_attempt_at", "created_at");
