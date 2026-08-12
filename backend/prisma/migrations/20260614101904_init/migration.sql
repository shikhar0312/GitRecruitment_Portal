-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('active', 'inactive', 'prospect');

-- CreateEnum
CREATE TYPE "HiringType" AS ENUM ('contract', 'permanent', 'fixed_term');

-- CreateEnum
CREATE TYPE "JobOpeningStatus" AS ENUM ('open', 'on_hold', 'filled', 'cancelled');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('onsite', 'remote', 'hybrid');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('immediate', 'notice_period', 'not_looking', 'open_to_opportunities');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('active', 'placed', 'inactive', 'blacklisted');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('referral', 'linkedin', 'job_board', 'direct', 'agency');

-- CreateEnum
CREATE TYPE "Proficiency" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('basic', 'conversational', 'professional', 'native');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('shortlisted', 'screening', 'interviewing', 'offered', 'placed', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('screening', 'technical', 'hr', 'cultural_fit', 'final');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('video', 'phone', 'onsite');

-- CreateEnum
CREATE TYPE "InterviewOutcome" AS ENUM ('passed', 'failed', 'no_show', 'rescheduled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'invoiced', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'recruiter', 'account_manager', 'finance', 'viewer');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "website" TEXT,
    "country" TEXT,
    "city" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "account_manager_id" TEXT,
    "status" "CompanyStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "serial_no" SERIAL NOT NULL,
    "company_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "status" "JobOpeningStatus" NOT NULL,
    "min_exp_years" INTEGER NOT NULL,
    "max_exp_years" INTEGER NOT NULL,
    "budget_min" DECIMAL(65,30),
    "budget_max" DECIMAL(65,30),
    "budget_currency" VARCHAR(3) NOT NULL,
    "hiring_type" "HiringType" NOT NULL,
    "min_contract_months" INTEGER,
    "expected_start_date" DATE,
    "notice_period_buyback" BOOLEAN NOT NULL,
    "no_of_positions" INTEGER NOT NULL,
    "filled_positions" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "work_mode" "WorkMode" NOT NULL,
    "job_description" TEXT,
    "required_skills" TEXT[],
    "nice_to_have_skills" TEXT[],
    "priority" "Priority" NOT NULL,
    "closing_date" DATE,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "nationality" TEXT,
    "current_location" TEXT,
    "preferred_location" TEXT,
    "willing_to_relocate" BOOLEAN,
    "exp_years" INTEGER NOT NULL,
    "current_company" TEXT,
    "current_role" TEXT,
    "current_ctc" DECIMAL(65,30),
    "expected_ctc" DECIMAL(65,30),
    "expected_day_rate" DECIMAL(65,30),
    "currency" VARCHAR(3) NOT NULL,
    "notice_period_days" INTEGER,
    "availability_date" DATE,
    "availability_status" "AvailabilityStatus" NOT NULL,
    "highest_qualification" TEXT,
    "resume_url" TEXT,
    "resume_generated_at" TIMESTAMP(3),
    "source" "CandidateSource",
    "referred_by" TEXT,
    "status" "CandidateStatus" NOT NULL,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "years_exp" INTEGER,
    "proficiency" "Proficiency",
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_work_history" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "location" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL,
    "responsibilities" TEXT,
    "achievements" TEXT,
    "technologies_used" TEXT[],

    CONSTRAINT "candidate_work_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_education" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field_of_study" TEXT,
    "grade" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "is_current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "candidate_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_certifications" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuing_organization" TEXT NOT NULL,
    "issue_date" DATE,
    "expiry_date" DATE,
    "credential_id" TEXT,
    "credential_url" TEXT,

    CONSTRAINT "candidate_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_languages" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" "LanguageProficiency" NOT NULL,

    CONSTRAINT "candidate_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "job_opening_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "expected_availability" DATE,
    "match_score" DECIMAL(65,30),
    "rejection_reason" TEXT,
    "offer_date" DATE,
    "placed_date" DATE,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_rounds" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "round_type" "RoundType" NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "conducted_by" TEXT,
    "mode" "InterviewMode",
    "outcome" "InterviewOutcome",
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_records" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "demand_per_month" DECIMAL(65,30) NOT NULL,
    "bill_to_customer_gbp_monthly" DECIMAL(65,30) NOT NULL,
    "bill_to_customer_gbp_yearly" DECIMAL(65,30),
    "margin_per_month_inr" DECIMAL(65,30),
    "margin_pct" DECIMAL(65,30) NOT NULL,
    "invoice_ref" TEXT,
    "billing_period_start" DATE,
    "billing_period_end" DATE,
    "payment_status" "PaymentStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bucket_label" TEXT NOT NULL,
    "min_exp_years" INTEGER NOT NULL,
    "max_exp_years" INTEGER NOT NULL,
    "template_file_path" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "job_openings_serial_no_key" ON "job_openings"("serial_no");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_opening_id_candidate_id_key" ON "applications"("job_opening_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_records_application_id_key" ON "billing_records"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "resume_templates_bucket_label_key" ON "resume_templates"("bucket_label");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_account_manager_id_fkey" FOREIGN KEY ("account_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_work_history" ADD CONSTRAINT "candidate_work_history_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_education" ADD CONSTRAINT "candidate_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_certifications" ADD CONSTRAINT "candidate_certifications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_languages" ADD CONSTRAINT "candidate_languages_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_opening_id_fkey" FOREIGN KEY ("job_opening_id") REFERENCES "job_openings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_rounds" ADD CONSTRAINT "interview_rounds_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_records" ADD CONSTRAINT "billing_records_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
