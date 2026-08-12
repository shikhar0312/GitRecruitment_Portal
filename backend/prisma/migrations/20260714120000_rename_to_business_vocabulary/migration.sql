-- ═══════════════════════════════════════════════════════════════════
-- Rename to business vocabulary:
--   companies    -> customers
--   job_openings -> requirements
--   applications -> allocations
--
-- Pure renames only (ALTER ... RENAME). No data is dropped, copied,
-- or recreated. Safe to run against a live database with existing rows.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Rename enum types ─────────────────────────────────
ALTER TYPE "CompanyStatus" RENAME TO "CustomerStatus";
ALTER TYPE "JobOpeningStatus" RENAME TO "RequirementStatus";
ALTER TYPE "ApplicationStatus" RENAME TO "AllocationStatus";

-- ─── 2. Rename tables ──────────────────────────────────────
ALTER TABLE "companies" RENAME TO "customers";
ALTER TABLE "job_openings" RENAME TO "requirements";
ALTER TABLE "applications" RENAME TO "allocations";

-- ─── 3. Rename columns that referenced the old entity names ─
ALTER TABLE "requirements" RENAME COLUMN "company_id" TO "customer_id";
ALTER TABLE "allocations" RENAME COLUMN "job_opening_id" TO "requirement_id";
ALTER TABLE "interview_rounds" RENAME COLUMN "application_id" TO "allocation_id";
ALTER TABLE "billing_records" RENAME COLUMN "application_id" TO "allocation_id";

-- ─── 4. Rename primary key constraints ────────────────────
ALTER TABLE "customers" RENAME CONSTRAINT "companies_pkey" TO "customers_pkey";
ALTER TABLE "requirements" RENAME CONSTRAINT "job_openings_pkey" TO "requirements_pkey";
ALTER TABLE "allocations" RENAME CONSTRAINT "applications_pkey" TO "allocations_pkey";

-- ─── 5. Rename foreign key constraints ────────────────────
ALTER TABLE "customers" RENAME CONSTRAINT "companies_account_manager_id_fkey" TO "customers_account_manager_id_fkey";

ALTER TABLE "requirements" RENAME CONSTRAINT "job_openings_company_id_fkey" TO "requirements_customer_id_fkey";
ALTER TABLE "requirements" RENAME CONSTRAINT "job_openings_role_id_fkey" TO "requirements_role_id_fkey";
ALTER TABLE "requirements" RENAME CONSTRAINT "job_openings_created_by_fkey" TO "requirements_created_by_fkey";

ALTER TABLE "allocations" RENAME CONSTRAINT "applications_job_opening_id_fkey" TO "allocations_requirement_id_fkey";
ALTER TABLE "allocations" RENAME CONSTRAINT "applications_candidate_id_fkey" TO "allocations_candidate_id_fkey";
ALTER TABLE "allocations" RENAME CONSTRAINT "applications_created_by_fkey" TO "allocations_created_by_fkey";

ALTER TABLE "interview_rounds" RENAME CONSTRAINT "interview_rounds_application_id_fkey" TO "interview_rounds_allocation_id_fkey";
ALTER TABLE "billing_records" RENAME CONSTRAINT "billing_records_application_id_fkey" TO "billing_records_allocation_id_fkey";

-- ─── 6. Rename indexes (Prisma names indexes after table_columns_key) ─
ALTER INDEX "job_openings_serial_no_key" RENAME TO "requirements_serial_no_key";
ALTER INDEX "applications_job_opening_id_candidate_id_key" RENAME TO "allocations_requirement_id_candidate_id_key";
ALTER INDEX "billing_records_application_id_key" RENAME TO "billing_records_allocation_id_key";
