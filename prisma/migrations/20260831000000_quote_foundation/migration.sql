-- CreateTable
CREATE TABLE "quotes" (
    "id" VARCHAR(30) NOT NULL,
    "room_type_id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30),
    "guest_session_id" VARCHAR(64),
    "checkin_date" DATE NOT NULL,
    "checkout_date" DATE NOT NULL,
    "adult_count" SMALLINT NOT NULL,
    "child_count" SMALLINT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "service_fee" INTEGER NOT NULL,
    "grand_total" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "quotes_owner_check" CHECK (("user_id" IS NOT NULL) <> ("guest_session_id" IS NOT NULL)),
    CONSTRAINT "quotes_dates_check" CHECK ("checkout_date" > "checkin_date"),
    CONSTRAINT "quotes_guests_check" CHECK ("adult_count" BETWEEN 1 AND 10 AND "child_count" BETWEEN 0 AND 10),
    CONSTRAINT "quotes_money_check" CHECK ("subtotal" > 0 AND "service_fee" >= 0 AND "grand_total" = "subtotal" + "service_fee")
);

-- CreateTable
CREATE TABLE "quote_nights" (
    "quote_id" VARCHAR(30) NOT NULL,
    "stay_date" DATE NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "quote_nights_pkey" PRIMARY KEY ("quote_id", "stay_date"),
    CONSTRAINT "quote_nights_price_check" CHECK ("unit_price" > 0)
);

-- CreateIndex
CREATE INDEX "quotes_user_id_expires_at_idx" ON "quotes"("user_id", "expires_at");
CREATE INDEX "quotes_guest_session_id_expires_at_idx" ON "quotes"("guest_session_id", "expires_at");
CREATE INDEX "quotes_room_type_id_checkin_date_checkout_date_idx" ON "quotes"("room_type_id", "checkin_date", "checkout_date");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quote_nights" ADD CONSTRAINT "quote_nights_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
