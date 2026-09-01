-- Add immutable booking snapshots required for operations and vouchers.
ALTER TABLE "bookings"
    ADD COLUMN "property_name" VARCHAR(150),
    ADD COLUMN "room_name" VARCHAR(150),
    ADD COLUMN "guest_name" VARCHAR(100),
    ADD COLUMN "guest_email" VARCHAR(254),
    ADD COLUMN "guest_phone" VARCHAR(20),
    ADD COLUMN "cancellation_policy" TEXT;

-- Backfill development or pre-release bookings from their current relations.
UPDATE "bookings" AS b
SET
    "property_name" = p."name",
    "room_name" = r."name",
    "guest_name" = COALESCE(
        (SELECT u."name" FROM "users" AS u WHERE u."id" = b."user_id"),
        'Guest'
    ),
    "guest_email" = COALESCE(
        (SELECT u."email" FROM "users" AS u WHERE u."id" = b."user_id"),
        'guest@legacy.invalid'
    ),
    "guest_phone" = 'Not provided',
    "cancellation_policy" = p."cancellation_policy"
FROM "room_types" AS r
JOIN "properties" AS p ON p."id" = r."property_id"
WHERE b."room_type_id" = r."id";

ALTER TABLE "bookings"
    ALTER COLUMN "property_name" SET NOT NULL,
    ALTER COLUMN "room_name" SET NOT NULL,
    ALTER COLUMN "guest_name" SET NOT NULL,
    ALTER COLUMN "guest_email" SET NOT NULL,
    ALTER COLUMN "guest_phone" SET NOT NULL,
    ALTER COLUMN "cancellation_policy" SET NOT NULL;
