-- ═══════════════════════════════════════════════════════════════════
-- Change requests batch: customer contacts, visa/clearance tracking,
-- billing entity on requirements, and Billing -> Tracker (margin_records).
--
-- NOTE: this migration assumes a fresh/empty database (confirmed no
-- production data exists yet). The billing_records -> margin_records
-- change is a genuine schema redesign (currency-specific columns like
-- bill_to_customer_gbp_monthly become currency-agnostic), not a pure
-- rename, so old billing_records rows are dropped rather than migrated.
-- If this is ever run against a database with real billing data, back
-- it up first — this migration does not attempt to convert old rows.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. New enums ──────────────────────────────────────────
CREATE TYPE "BillingEntity" AS ENUM ('git_uk_ltd', 'git_india_llp', 'git_uae_fze');
CREATE TYPE "ContactLabel" AS ENUM ('primary', 'secondary', 'hr', 'procurement', 'finance', 'other');

-- ─── 2. customer_contacts table ───────────────────────────
CREATE TABLE "customer_contacts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "label" "ContactLabel" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 3. Drop old flat contact fields from customers ───────
-- (No data migration — fresh database, no existing customer rows to preserve.)
ALTER TABLE "customers" DROP COLUMN "contact_name";
ALTER TABLE "customers" DROP COLUMN "contact_email";
ALTER TABLE "customers" DROP COLUMN "contact_phone";

-- ─── 4. Visa / security clearance fields on candidates ────
ALTER TABLE "candidates" ADD COLUMN "requires_visa_sponsorship" BOOLEAN;
ALTER TABLE "candidates" ADD COLUMN "visa_status" TEXT;
ALTER TABLE "candidates" ADD COLUMN "security_clearance_level" TEXT;
ALTER TABLE "candidates" ADD COLUMN "security_clearance_expiry" DATE;

-- ─── 5. Visa / clearance + billing entity fields on requirements ─
ALTER TABLE "requirements" ADD COLUMN "visa_sponsorship_available" BOOLEAN;
ALTER TABLE "requirements" ADD COLUMN "clearance_required" TEXT;

-- billing_entity is required (NOT NULL) going forward, but existing rows
-- (if any) need a default to backfill before the NOT NULL constraint can
-- apply. Fresh database has no rows, so this is a no-op in practice —
-- the DEFAULT is dropped immediately after so future inserts must specify
-- it explicitly via the application layer.
ALTER TABLE "requirements" ADD COLUMN "billing_entity" "BillingEntity" NOT NULL DEFAULT 'git_uk_ltd';
ALTER TABLE "requirements" ALTER COLUMN "billing_entity" DROP DEFAULT;

-- ─── 6. Drop old billing_records, create margin_records ───
DROP TABLE "billing_records";

CREATE TABLE "margin_records" (
    "id" TEXT NOT NULL,
    "allocation_id" TEXT NOT NULL,
    "billing_entity" "BillingEntity" NOT NULL,

    "demand_amount" DECIMAL(65,30) NOT NULL,
    "demand_currency" VARCHAR(3) NOT NULL,
    "demand_fx_rate" DECIMAL(65,30) NOT NULL,
    "demand_converted" DECIMAL(65,30) NOT NULL,

    "billed_amount" DECIMAL(65,30) NOT NULL,
    "billed_currency" VARCHAR(3) NOT NULL,
    "billed_fx_rate" DECIMAL(65,30) NOT NULL,
    "billed_converted" DECIMAL(65,30) NOT NULL,
    "billed_converted_yearly" DECIMAL(65,30),

    "margin_amount" DECIMAL(65,30) NOT NULL,
    "margin_pct" DECIMAL(65,30) NOT NULL,
    "reporting_currency" VARCHAR(3) NOT NULL,
    "fx_rate_locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "invoice_ref" TEXT,
    "billing_period_start" DATE,
    "billing_period_end" DATE,
    "payment_status" "PaymentStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "margin_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "margin_records_allocation_id_key" ON "margin_records"("allocation_id");

ALTER TABLE "margin_records" ADD CONSTRAINT "margin_records_allocation_id_fkey"
    FOREIGN KEY ("allocation_id") REFERENCES "allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
