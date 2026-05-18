CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_priced_rollups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"installation_id" uuid NOT NULL,
	"local_date" date NOT NULL,
	"tariff_version_id" uuid,
	"generated_kwh" numeric(10, 6) NOT NULL,
	"import_kwh" numeric(10, 6) NOT NULL,
	"export_kwh" numeric(10, 6) NOT NULL,
	"consumed_kwh" numeric(10, 6) NOT NULL,
	"immersion_diverted_kwh" numeric(10, 6) NOT NULL,
	"total_reading_count" integer NOT NULL,
	"slot_count" smallint NOT NULL,
	"is_partial" boolean NOT NULL,
	"import_cost" numeric(12, 6),
	"export_credit" numeric(12, 6),
	"self_consumed_solar_value" numeric(12, 6),
	"without_solar_import_cost" numeric(12, 6),
	"fixed_charges" numeric(12, 6),
	"free_import_kwh" numeric(10, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interval_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"installation_id" uuid NOT NULL,
	"interval_start" timestamp with time zone NOT NULL,
	"import_kwh" numeric(10, 6) NOT NULL,
	"generation_kwh" numeric(10, 6) NOT NULL,
	"export_kwh" numeric(10, 6) NOT NULL,
	"immersion_diverted_kwh" numeric(10, 6) NOT NULL,
	"immersion_boosted_kwh" numeric(10, 6) NOT NULL,
	"consumed_kwh" numeric(10, 6) NOT NULL,
	"reading_count" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_summaries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "daily_summaries" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_approved_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "installations" ADD COLUMN "notification_preferences_json" jsonb;--> statement-breakpoint
ALTER TABLE "daily_priced_rollups" ADD CONSTRAINT "daily_priced_rollups_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_priced_rollups" ADD CONSTRAINT "daily_priced_rollups_tariff_version_id_tariff_plan_versions_id_fk" FOREIGN KEY ("tariff_version_id") REFERENCES "public"."tariff_plan_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interval_readings" ADD CONSTRAINT "interval_readings_installation_id_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_username_idx" ON "admin_users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_priced_rollups_installation_date_idx" ON "daily_priced_rollups" USING btree ("installation_id","local_date");--> statement-breakpoint
CREATE UNIQUE INDEX "interval_readings_installation_interval_idx" ON "interval_readings" USING btree ("installation_id","interval_start");--> statement-breakpoint
CREATE INDEX "interval_readings_installation_interval_brin" ON "interval_readings" USING btree ("installation_id","interval_start");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_email_idx" ON "waitlist_entries" USING btree ("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_approved_by_admin_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installations" DROP COLUMN "finance_mode";--> statement-breakpoint
ALTER TABLE "installations" DROP COLUMN "finance_investment_date";--> statement-breakpoint
ALTER TABLE "installations" DROP COLUMN "install_cost_amount";--> statement-breakpoint
ALTER TABLE "installations" DROP COLUMN "monthly_finance_payment_amount";--> statement-breakpoint
ALTER TABLE "installations" DROP COLUMN "finance_term_months";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";