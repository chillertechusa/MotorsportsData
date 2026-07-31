CREATE TYPE "public"."order_status" AS ENUM('pending', 'in_production', 'quality_check', 'ready', 'shipped', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."print_type" AS ENUM('screen_print', 'embroidery', 'dtf', 'sublimation');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'pro_rider', 'coach', 'shop', 'team', 'brand', 'admin', 'owner');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blanks" (
	"id" serial PRIMARY KEY NOT NULL,
	"styleNumber" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"wholesaleCost" numeric(10, 2) NOT NULL,
	"colors" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "md_abandoned_checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"plan" varchar(50) NOT NULL,
	"email_sent" boolean DEFAULT false,
	"converted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_access_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewer_user_id" text NOT NULL,
	"viewer_role" varchar(20) NOT NULL,
	"rider_profile_id" uuid,
	"team_id" uuid,
	"resource" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_advisor_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advisor_key" varchar(30) NOT NULL,
	"period" varchar(20) DEFAULT '30d' NOT NULL,
	"health_signal" varchar(20) DEFAULT 'watch' NOT NULL,
	"headline" varchar(300) NOT NULL,
	"summary" text,
	"metrics" jsonb DEFAULT '{}' NOT NULL,
	"recommendations" jsonb DEFAULT '[]' NOT NULL,
	"synthesized_by" varchar(40) DEFAULT 'rules' NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_alert_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"rule_id" uuid,
	"alert_type" varchar(60) NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb,
	"push_sent" integer DEFAULT 0,
	"fired_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"alert_type" varchar(60) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"threshold_value" integer,
	"threshold_direction" varchar(10) DEFAULT 'above',
	"cooldown_seconds" integer DEFAULT 300 NOT NULL,
	"last_fired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_alert_thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"tire_temp_high_warn" integer DEFAULT 100,
	"tire_temp_high_critical" integer DEFAULT 110,
	"engine_temp_high_warn" integer DEFAULT 105,
	"engine_temp_high_critical" integer DEFAULT 120,
	"pace_drop_warn_seconds" double precision DEFAULT 2,
	"pace_drop_critical_seconds" double precision DEFAULT 4,
	"brake_fade_warn_percent" integer DEFAULT 20,
	"brake_fade_critical_percent" integer DEFAULT 35,
	"fuel_low_warn_percent" integer DEFAULT 25,
	"fuel_low_critical_percent" integer DEFAULT 10,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_analytics_daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_date" date NOT NULL,
	"signups" integer DEFAULT 0,
	"checkouts" integer DEFAULT 0,
	"revenue_cents" integer DEFAULT 0,
	"active_subscriptions" integer DEFAULT 0,
	"tier_distribution" jsonb,
	"billing_frequency_distribution" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"user_id" text,
	"team_id" uuid,
	"tier" varchar(50),
	"billing_frequency" varchar(20),
	"amount_cents" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"scope" text DEFAULT 'api:read' NOT NULL,
	"rate_limit" integer DEFAULT 500 NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "md_api_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"response_time" integer NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"request_size" integer,
	"response_size" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_assignment_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"event_data" jsonb,
	"action_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_championship_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"series_name" varchar(200) NOT NULL,
	"discipline" varchar(100) DEFAULT 'supercross' NOT NULL,
	"year" integer NOT NULL,
	"current_round" integer DEFAULT 1 NOT NULL,
	"total_rounds" integer DEFAULT 17 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_championship_standings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"rider_name" varchar(255) NOT NULL,
	"rider_number" integer,
	"team_name" varchar(255),
	"points" integer DEFAULT 0 NOT NULL,
	"last_result" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"rider_email" varchar(255) NOT NULL,
	"assignment_spec" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	"acknowledged_at" timestamp with time zone,
	"acknowledged_ip" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"due_at" timestamp with time zone,
	"linked_telemetry_id" uuid,
	"compliance_result" varchar(20),
	"compliance_notes" text
);
--> statement-breakpoint
CREATE TABLE "md_coach_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_team_id" text NOT NULL,
	"user_id" text,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"date_of_birth" date,
	"discipline" varchar(50),
	"class_category" varchar(100),
	"home_track" varchar(150),
	"sponsor_note" text,
	"emergency_contact_name" varchar(150),
	"emergency_contact_phone" varchar(30),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"avatar_url" text,
	"enrolled_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_effectiveness" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"coach_email" varchar(255) NOT NULL,
	"sessions_coached" integer DEFAULT 0,
	"readiness_accuracy" double precision,
	"riders_improved" integer DEFAULT 0,
	"avg_lap_improvement" double precision,
	"setup_recommendations" integer DEFAULT 0,
	"successful_setup_changes" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_team_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"package_id" uuid,
	"invoice_number" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"due_date" date NOT NULL,
	"paid_at" timestamp with time zone,
	"line_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"square_invoice_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_team_id" text NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"session_count" integer,
	"duration_weeks" integer,
	"price_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"cadence" varchar(20) DEFAULT 'monthly' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_session_athletes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"attendance_status" varchar(20) DEFAULT 'invited' NOT NULL,
	"performance_rating" integer,
	"coach_note" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_team_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"session_type" varchar(50) DEFAULT 'track' NOT NULL,
	"discipline" varchar(50),
	"location" varchar(200),
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"ai_debrief" text,
	"video_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_template_access_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"team_member_id" uuid,
	"ip_address" varchar(50),
	"user_agent" text,
	"action" varchar(50) NOT NULL,
	"denied_reason" varchar(255),
	"accessed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_coach_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"encrypted_content" text NOT NULL,
	"access_level" varchar(50) DEFAULT 'team_only',
	"display_watermark" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"doc_key" varchar(40) NOT NULL,
	"doc_version" varchar(20) NOT NULL,
	"consent_basis" varchar(20) DEFAULT 'self' NOT NULL,
	"guardian_user_id" text,
	"guardian_name" varchar(255),
	"guardian_email" varchar(255),
	"guardian_relationship" varchar(60),
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_conversion_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"step" varchar(50) NOT NULL,
	"source_page" varchar(255),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"category" varchar(100) DEFAULT 'Other' NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"expense_date" date NOT NULL,
	"description" text,
	"receipt_url" text,
	"linked_schedule_event_id" uuid,
	"linked_part_vault_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_external_access_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_account_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"rider_user_id" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" varchar(20) DEFAULT 'external' NOT NULL,
	"scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"billable" boolean DEFAULT true NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now(),
	"granted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"credit_awarded_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_external_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_type" varchar(30) NOT NULL,
	"org_name" varchar(255),
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"website" varchar(255),
	"bio" text,
	"logo_url" text,
	"billing_status" varchar(30) DEFAULT 'none' NOT NULL,
	"plan_tier" varchar(50),
	"billing_frequency" varchar(20) DEFAULT 'annual',
	"seat_included_riders" integer DEFAULT 3,
	"square_customer_id" varchar(255),
	"square_subscription_id" varchar(255),
	"is_comped" boolean DEFAULT false NOT NULL,
	"verification_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_feature_gate_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"feature_key" varchar(100) NOT NULL,
	"access_granted" boolean NOT NULL,
	"triggered_modal" boolean DEFAULT false,
	"clicked_upgrade" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_feature_gates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_key" varchar(100) NOT NULL,
	"feature_name" varchar(255) NOT NULL,
	"description" text,
	"min_tier" varchar(50) NOT NULL,
	"upsell_tier" varchar(50) NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_feature_gates_feature_key_unique" UNIQUE("feature_key")
);
--> statement-breakpoint
CREATE TABLE "md_founding_rigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" text NOT NULL,
	"plan_id" varchar(50) NOT NULL,
	"cohort" varchar(30) DEFAULT 'founding_rig' NOT NULL,
	"locked_cents" integer NOT NULL,
	"frequency" varchar(20) DEFAULT 'monthly' NOT NULL,
	"slot_number" integer NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now(),
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"onboarding_data" jsonb,
	CONSTRAINT "md_founding_rigs_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "md_hydration_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"pre_ride_weight_kg" numeric(5, 2),
	"post_ride_weight_kg" numeric(5, 2),
	"water_consumed_ml" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_incident_alert_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid,
	"alert_rule_id" uuid,
	"channel" varchar(50) NOT NULL,
	"recipient" varchar(255),
	"status" varchar(20) NOT NULL,
	"message" text,
	"response_code" integer,
	"error_reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_incident_alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"check_type" varchar(50) NOT NULL,
	"condition" varchar(50) NOT NULL,
	"threshold" integer,
	"enabled" boolean DEFAULT true,
	"notify_slack" boolean DEFAULT false,
	"notify_email" boolean DEFAULT false,
	"slack_channel" varchar(255),
	"slack_webhook_url" text,
	"email_recipients" jsonb,
	"cooldown_minutes" integer DEFAULT 15,
	"last_triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"error_message" text,
	"last_occurred_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" text,
	"failure_count" integer DEFAULT 1,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_injuries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"body_region" varchar(100) NOT NULL,
	"injury_type" varchar(100) NOT NULL,
	"severity" integer DEFAULT 1 NOT NULL,
	"incident_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"is_concussion" boolean DEFAULT false NOT NULL,
	"rtr_stage" integer DEFAULT 0 NOT NULL,
	"rtr_stage_started_at" timestamp with time zone,
	"rtr_cleared_at" timestamp with time zone,
	"cleared_by" varchar(255),
	"notes" text,
	"linked_schedule_event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_interview_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"scenario_type" varchar(50) NOT NULL,
	"question_text" text NOT NULL,
	"rider_answer_text" text NOT NULL,
	"ai_feedback" jsonb,
	"score" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"sponsor_id" uuid,
	"invoice_number" varchar(40) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"amount_cents" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"square_invoice_id" varchar(100),
	"square_order_id" varchar(100),
	"public_url" text,
	"due_date" date,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_legal_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_key" varchar(40) NOT NULL,
	"version" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"requires_acceptance" boolean DEFAULT true NOT NULL,
	"effective_date" date,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_live_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"live_session_id" uuid NOT NULL,
	"alert_type" varchar(100) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"trigger_data" jsonb,
	"recommendation" text,
	"acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_live_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"rider_email" varchar(255) NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"session_token" varchar(512) NOT NULL,
	"is_active" boolean DEFAULT true,
	"stream_started_at" timestamp with time zone DEFAULT now(),
	"current_lap" integer DEFAULT 0,
	"total_laps" integer DEFAULT 0,
	"best_lap_seconds" double precision,
	"lap_start_time" timestamp with time zone,
	"session_duration_seconds" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_live_telemetry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"live_session_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"lap_number" integer NOT NULL,
	"lap_time_seconds" double precision,
	"speed" double precision NOT NULL,
	"throttle" double precision NOT NULL,
	"brake_pressure" double precision,
	"tire_press_front" double precision,
	"tire_press_rear" double precision,
	"engine_temp_c" double precision,
	"engine_rpm_k" double precision,
	"g_lateral" double precision,
	"g_longitudinal" double precision,
	"suspension_travel_front" double precision,
	"suspension_travel_rear" double precision,
	"gps_lat" double precision,
	"gps_lon" double precision,
	"device_timestamp" numeric(20, 0),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_mechanic_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mechanic_user_id" text NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"work_order_id" uuid,
	"session_id" uuid,
	"title" varchar(255) NOT NULL,
	"parameter" varchar(255) NOT NULL,
	"value_before" varchar(255) NOT NULL,
	"value_after" varchar(255) NOT NULL,
	"rationale" text,
	"estimated_lap_time_delta" double precision,
	"actual_lap_time_delta" double precision,
	"accuracy" double precision,
	"status" varchar(50) DEFAULT 'suggested',
	"applied_at" timestamp with time zone,
	"evaluated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_mechanic_portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid NOT NULL,
	"display_name" varchar(255),
	"bio" text,
	"total_riders_served" integer DEFAULT 0,
	"total_lap_time_savings" double precision DEFAULT 0,
	"average_efficiency_score" double precision DEFAULT 0,
	"total_work_orders" integer DEFAULT 0,
	"verification_status" varchar(50) DEFAULT 'unverified',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_mechanic_portfolio_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "md_mental_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"entry_date" date NOT NULL,
	"entry_type" varchar(50) DEFAULT 'daily' NOT NULL,
	"mood" integer,
	"focus" integer,
	"anxiety" integer,
	"confidence" integer,
	"motivation" integer,
	"notes" text,
	"linked_schedule_event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_nutrition_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"meal_type" varchar(50) DEFAULT 'meal' NOT NULL,
	"food_name" varchar(255) NOT NULL,
	"quantity_grams" numeric(8, 1),
	"calories" numeric(8, 1),
	"protein_g" numeric(8, 1),
	"carbs_g" numeric(8, 1),
	"fat_g" numeric(8, 1),
	"water_ml" integer,
	"fdc_id" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_owner_backup_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_email" text NOT NULL,
	"label" integer NOT NULL,
	"code_hash" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp with time zone,
	"batch_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "md_part_vault" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid,
	"part_name" varchar(255) NOT NULL,
	"current_hours" double precision DEFAULT 0,
	"max_hours" double precision NOT NULL,
	"stock_in_truck" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "md_push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"endpoint" text NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "md_rider_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"team_id" uuid,
	"grant_id" uuid,
	"amount_cents" integer NOT NULL,
	"reason" varchar(60) NOT NULL,
	"balance_after_cents" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_rider_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_user_id" text NOT NULL,
	"team_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_of_birth" date NOT NULL,
	"age_bracket" varchar(20) DEFAULT 'teen_16_17' NOT NULL,
	"is_minor" boolean DEFAULT true NOT NULL,
	"guardian_relationship" varchar(50) DEFAULT 'parent' NOT NULL,
	"promotion_status" varchar(20) DEFAULT 'active' NOT NULL,
	"promoted_user_id" text,
	"promoted_at" timestamp with time zone,
	"rider_email" varchar(255),
	"discoverable" boolean DEFAULT false NOT NULL,
	"pro_locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_rider_readiness" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"entry_date" date NOT NULL,
	"sleep_hours" numeric(4, 1),
	"sleep_score" integer,
	"hrv" integer,
	"resting_hr" integer,
	"energy" integer,
	"fatigue" integer,
	"notes" text,
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_runbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"estimated_time_minutes" integer,
	"automatable" boolean DEFAULT false,
	"auto_remedy_script" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_schedule_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"title" varchar(255) NOT NULL,
	"event_type" varchar(50) DEFAULT 'practice' NOT NULL,
	"event_date" date NOT NULL,
	"track_id" uuid,
	"lat" double precision,
	"lng" double precision,
	"series" varchar(100),
	"finish_position" integer,
	"series_result_url" text,
	"entry_fee_cents" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sentinel" varchar(20) NOT NULL,
	"event_type" varchar(60) NOT NULL,
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"actor_user_id" text,
	"external_account_id" uuid,
	"team_id" uuid,
	"target_ref" text,
	"ip_address" varchar(64),
	"user_agent" text,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"detected_by" varchar(20) DEFAULT 'inline' NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_by" text,
	"acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_session_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"rider_email" varchar(255),
	"best_lap_seconds" double precision,
	"avg_lap_seconds" double precision,
	"improvement_trend" integer,
	"setup_changed" boolean DEFAULT false,
	"delta_vs_previous" double precision,
	"readiness_score" integer,
	"difficulty" varchar(20),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"track_name" varchar(255) NOT NULL,
	"track_conditions" varchar(255),
	"rider_feedback" text,
	"best_lap_seconds" double precision,
	"session_hours" double precision DEFAULT 0,
	"session_date" date DEFAULT now(),
	"ambient_temp_f" integer,
	"humidity_pct" integer,
	"wind_mph" integer,
	"track_surface" varchar(80),
	"tire_front" varchar(120),
	"tire_rear" varchar(120),
	"tire_pressure_front" double precision,
	"tire_pressure_rear" double precision,
	"fuel_mix" varchar(80),
	"jet_needle" varchar(80),
	"air_filter_condition" varchar(80),
	"engine_map" varchar(80),
	"share_token" varchar(32),
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_sessions_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "md_setup_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"session_id" uuid,
	"parameter_key" varchar(255) NOT NULL,
	"parameter_value" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "md_sponsors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"sponsor_name" varchar(255) NOT NULL,
	"sponsor_type" varchar(50) DEFAULT 'cash' NOT NULL,
	"value_cents" integer DEFAULT 0 NOT NULL,
	"season" varchar(20),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"deliverables" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"contact_email" varchar(255),
	"contact_name" varchar(255),
	"square_customer_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_square_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"merchant_id" varchar(100) NOT NULL,
	"location_id" varchar(100) NOT NULL,
	"merchant_name" varchar(255),
	"access_token_encrypted" text NOT NULL,
	"access_token_iv" varchar(32) NOT NULL,
	"access_token_tag" varchar(32) NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"refresh_token_iv" varchar(32) NOT NULL,
	"refresh_token_tag" varchar(32) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb,
	"connected_at" timestamp with time zone DEFAULT now(),
	"refreshed_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_square_connections_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "md_square_plan_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" varchar(50) NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"square_plan_id" varchar(255) NOT NULL,
	"square_variation_id" varchar(255) NOT NULL,
	"amount_cents" integer NOT NULL,
	"environment" varchar(20) DEFAULT 'production' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"from_tier" varchar(50),
	"to_tier" varchar(50),
	"amount_cents" integer,
	"billing_period" varchar(20),
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_system_health_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_type" varchar(50) DEFAULT 'system_health' NOT NULL,
	"status" varchar(20) NOT NULL,
	"message" text,
	"response_time_ms" integer,
	"cron_execution_healthy" boolean DEFAULT false,
	"cron_last_run_age_minutes" integer,
	"incident_creation_healthy" boolean DEFAULT false,
	"alert_rules_accessible" boolean DEFAULT false,
	"alert_delivery_healthy" boolean DEFAULT false,
	"database_responsive" boolean DEFAULT false,
	"error_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_team_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"week_start" timestamp with time zone NOT NULL,
	"session_count" integer DEFAULT 0,
	"avg_best_lap" double precision,
	"fastest_rider" varchar(255),
	"fastest_lap_overall" double precision,
	"most_improving" varchar(255),
	"avg_readiness" double precision,
	"setup_changes" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(50) DEFAULT 'mechanic',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"subscription_tier" varchar(50) DEFAULT 'privateer',
	"subscription_status" varchar(50) DEFAULT 'inactive',
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"square_customer_id" varchar(255),
	"rider_name" varchar(255),
	"rider_birth_year" integer,
	"rider_class" varchar(100),
	"expiry_alert_sent_at" timestamp with time zone,
	"discipline" varchar(60),
	"payment_status" varchar(50) DEFAULT 'active',
	"last_payment_attempt" timestamp with time zone,
	"payment_failure_count" integer DEFAULT 0,
	"downgraded_at" timestamp with time zone,
	"square_subscription_id" varchar(255),
	"square_card_id" varchar(255),
	"square_plan_variation_id" varchar(255),
	"billing_frequency" varchar(20) DEFAULT 'annual',
	"cancel_at_period_end" boolean DEFAULT false,
	"subscription_canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_telemetry_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"device_type" varchar(100) NOT NULL,
	"friendly_name" varchar(255),
	"credentials" jsonb,
	"supported_formats" jsonb,
	"last_sync_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_telemetry_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"device_id" uuid,
	"source_blob_pathname" text,
	"file_format" varchar(20) NOT NULL,
	"parsed_data" jsonb,
	"linked_session_ids" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"imported_at" timestamp with time zone DEFAULT now(),
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "md_terra_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"terra_user_id" varchar(255),
	"reference_id" varchar(255),
	"rider_name" varchar(255),
	"provider" varchar(100),
	"latest_hr" integer,
	"latest_hr_at" timestamp with time zone,
	"hr_history" jsonb DEFAULT '[]'::jsonb,
	"connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_terra_connections_terra_user_id_unique" UNIQUE("terra_user_id")
);
--> statement-breakpoint
CREATE TABLE "md_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(255),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'USA',
	"center_lat" double precision,
	"center_lng" double precision,
	"track_type" varchar(50) DEFAULT 'MOTOCROSS',
	"boundary" jsonb,
	"zoom" integer DEFAULT 15,
	"surface" varchar(100),
	"features" text[],
	"elevation_change" integer,
	"lap_length_miles" double precision,
	"source" varchar(100),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_tracks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "md_training_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_team_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"week_start" date NOT NULL,
	"week_end" date NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"goals" text,
	"physical_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"technical_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mental_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nutrition_notes" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_user_compliance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date_of_birth" date,
	"birth_year" integer,
	"age_at_signup" integer,
	"age_bracket" varchar(20),
	"is_minor" boolean DEFAULT false NOT NULL,
	"requires_guardian" boolean DEFAULT false NOT NULL,
	"coppa_status" varchar(30) DEFAULT 'not_applicable' NOT NULL,
	"guardian_user_id" text,
	"guardian_name" varchar(255),
	"guardian_email" varchar(255),
	"guardian_relationship" varchar(60),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "md_user_compliance_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "md_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"engine_hours" double precision DEFAULT 0,
	"spec_key" varchar(100),
	"discipline" varchar(100),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_video_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"original_filename" varchar(255),
	"vehicle_id" uuid,
	"linked_schedule_event_id" uuid,
	"rider_notes" text,
	"analysis" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status_code" integer,
	"response_time" integer,
	"error" text,
	"attempt" integer DEFAULT 1 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"success" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"events" text NOT NULL,
	"secret" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"retry_attempts" integer DEFAULT 3 NOT NULL,
	"retry_delay" integer DEFAULT 5000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_work_order_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"part_vault_id" uuid,
	"part_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_cost_cents" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "md_work_order_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"blob_pathname" text NOT NULL,
	"caption" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "md_work_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"assigned_mechanic_user_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"labor_hours" double precision DEFAULT 0,
	"labor_started_at" timestamp with time zone,
	"labor_closed_at" timestamp with time zone,
	"suspension_before" jsonb,
	"suspension_after" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"customerName" text NOT NULL,
	"customerEmail" text NOT NULL,
	"customerPhone" text,
	"productType" text NOT NULL,
	"printType" "print_type" DEFAULT 'screen_print' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"sizes" text,
	"colors" text,
	"notes" text,
	"artworkUrl" text,
	"unitPrice" numeric(10, 2),
	"totalPrice" numeric(10, 2),
	"blankId" integer,
	"numColors" integer DEFAULT 1,
	"printLocations" integer DEFAULT 1,
	"garmentCost" numeric(10, 2),
	"breakdown" jsonb,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"assignedTo" text,
	"dueDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"screenSetupFee" numeric(10, 2) DEFAULT '20.00' NOT NULL,
	"colorChangeFee" numeric(10, 2) DEFAULT '15.00' NOT NULL,
	"sizeTagFee" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"defaultMarkup" numeric(5, 2) DEFAULT '2.00' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"basePrice" numeric(10, 2) NOT NULL,
	"image" text,
	"available" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"memberId" integer NOT NULL,
	"event" text NOT NULL,
	"track" text,
	"position" integer,
	"totalRiders" integer,
	"points" integer DEFAULT 0 NOT NULL,
	"raceDate" timestamp NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"gamerTag" text NOT NULL,
	"realName" text,
	"platform" text DEFAULT 'PlayStation' NOT NULL,
	"racingNumber" integer,
	"bio" text,
	"avatar" text,
	"wins" integer DEFAULT 0 NOT NULL,
	"podiums" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retail_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"variantId" integer,
	"productName" text NOT NULL,
	"color" text NOT NULL,
	"size" text NOT NULL,
	"unitPriceCents" integer NOT NULL,
	"quantity" integer NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "retail_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" text NOT NULL,
	"userId" text,
	"email" text NOT NULL,
	"customerName" text NOT NULL,
	"phone" text,
	"shipAddress1" text NOT NULL,
	"shipAddress2" text,
	"shipCity" text NOT NULL,
	"shipState" text NOT NULL,
	"shipZip" text NOT NULL,
	"subtotalCents" integer NOT NULL,
	"shippingCents" integer DEFAULT 0 NOT NULL,
	"taxCents" integer DEFAULT 0 NOT NULL,
	"totalCents" integer NOT NULL,
	"status" text DEFAULT 'paid' NOT NULL,
	"squarePaymentId" text,
	"trackingCarrier" text,
	"trackingNumber" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retail_orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "retail_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"priceCents" integer NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retail_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "retail_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"color" text NOT NULL,
	"size" text NOT NULL,
	"sku" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retail_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"banned_at" timestamp,
	"role" varchar(20) DEFAULT 'user',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"teeSize" text,
	"hoodieSize" text,
	"raceNumber" text,
	"riderClass" text,
	"homeTrack" text,
	"shipAddress1" text,
	"shipAddress2" text,
	"shipCity" text,
	"shipState" text,
	"shipZip" text,
	"phone" text,
	"smsOptIn" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_access_log" ADD CONSTRAINT "md_access_log_rider_profile_id_md_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."md_rider_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_access_log" ADD CONSTRAINT "md_access_log_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_alert_events" ADD CONSTRAINT "md_alert_events_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_alert_events" ADD CONSTRAINT "md_alert_events_rule_id_md_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."md_alert_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_alert_rules" ADD CONSTRAINT "md_alert_rules_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_alert_thresholds" ADD CONSTRAINT "md_alert_thresholds_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_analytics_events" ADD CONSTRAINT "md_analytics_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_analytics_events" ADD CONSTRAINT "md_analytics_events_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_api_keys" ADD CONSTRAINT "md_api_keys_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_api_usage" ADD CONSTRAINT "md_api_usage_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_api_usage" ADD CONSTRAINT "md_api_usage_api_key_id_md_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."md_api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_assignment_audit_log" ADD CONSTRAINT "md_assignment_audit_log_assignment_id_md_coach_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."md_coach_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_championship_series" ADD CONSTRAINT "md_championship_series_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_championship_standings" ADD CONSTRAINT "md_championship_standings_series_id_md_championship_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."md_championship_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_assignments" ADD CONSTRAINT "md_coach_assignments_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_effectiveness" ADD CONSTRAINT "md_coach_effectiveness_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_invoices" ADD CONSTRAINT "md_coach_invoices_client_id_md_coach_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."md_coach_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_invoices" ADD CONSTRAINT "md_coach_invoices_package_id_md_coach_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."md_coach_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_session_athletes" ADD CONSTRAINT "md_coach_session_athletes_session_id_md_coach_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."md_coach_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_session_athletes" ADD CONSTRAINT "md_coach_session_athletes_client_id_md_coach_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."md_coach_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_template_access_log" ADD CONSTRAINT "md_coach_template_access_log_template_id_md_coach_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."md_coach_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_coach_templates" ADD CONSTRAINT "md_coach_templates_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_conversion_events" ADD CONSTRAINT "md_conversion_events_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_expenses" ADD CONSTRAINT "md_expenses_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_expenses" ADD CONSTRAINT "md_expenses_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_expenses" ADD CONSTRAINT "md_expenses_linked_schedule_event_id_md_schedule_events_id_fk" FOREIGN KEY ("linked_schedule_event_id") REFERENCES "public"."md_schedule_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_external_access_grants" ADD CONSTRAINT "md_external_access_grants_external_account_id_md_external_accounts_id_fk" FOREIGN KEY ("external_account_id") REFERENCES "public"."md_external_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_external_access_grants" ADD CONSTRAINT "md_external_access_grants_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_feature_gate_logs" ADD CONSTRAINT "md_feature_gate_logs_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_hydration_log" ADD CONSTRAINT "md_hydration_log_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_incident_alert_history" ADD CONSTRAINT "md_incident_alert_history_incident_id_md_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."md_incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_incident_alert_history" ADD CONSTRAINT "md_incident_alert_history_alert_rule_id_md_incident_alert_rules_id_fk" FOREIGN KEY ("alert_rule_id") REFERENCES "public"."md_incident_alert_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_injuries" ADD CONSTRAINT "md_injuries_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_injuries" ADD CONSTRAINT "md_injuries_linked_schedule_event_id_md_schedule_events_id_fk" FOREIGN KEY ("linked_schedule_event_id") REFERENCES "public"."md_schedule_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_interview_sessions" ADD CONSTRAINT "md_interview_sessions_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_invoices" ADD CONSTRAINT "md_invoices_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_invoices" ADD CONSTRAINT "md_invoices_sponsor_id_md_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."md_sponsors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_live_alerts" ADD CONSTRAINT "md_live_alerts_live_session_id_md_live_sessions_id_fk" FOREIGN KEY ("live_session_id") REFERENCES "public"."md_live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_live_sessions" ADD CONSTRAINT "md_live_sessions_session_id_md_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."md_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_live_sessions" ADD CONSTRAINT "md_live_sessions_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_live_telemetry" ADD CONSTRAINT "md_live_telemetry_live_session_id_md_live_sessions_id_fk" FOREIGN KEY ("live_session_id") REFERENCES "public"."md_live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_mechanic_optimizations" ADD CONSTRAINT "md_mechanic_optimizations_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_mechanic_optimizations" ADD CONSTRAINT "md_mechanic_optimizations_work_order_id_md_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."md_work_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_mechanic_optimizations" ADD CONSTRAINT "md_mechanic_optimizations_session_id_md_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."md_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_mechanic_portfolio" ADD CONSTRAINT "md_mechanic_portfolio_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_mental_log" ADD CONSTRAINT "md_mental_log_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_mental_log" ADD CONSTRAINT "md_mental_log_linked_schedule_event_id_md_schedule_events_id_fk" FOREIGN KEY ("linked_schedule_event_id") REFERENCES "public"."md_schedule_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_nutrition_log" ADD CONSTRAINT "md_nutrition_log_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_part_vault" ADD CONSTRAINT "md_part_vault_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_push_subscriptions" ADD CONSTRAINT "md_push_subscriptions_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_rider_credits" ADD CONSTRAINT "md_rider_credits_grant_id_md_external_access_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."md_external_access_grants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_rider_profiles" ADD CONSTRAINT "md_rider_profiles_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_rider_readiness" ADD CONSTRAINT "md_rider_readiness_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_schedule_events" ADD CONSTRAINT "md_schedule_events_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_schedule_events" ADD CONSTRAINT "md_schedule_events_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_schedule_events" ADD CONSTRAINT "md_schedule_events_track_id_md_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."md_tracks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_security_events" ADD CONSTRAINT "md_security_events_external_account_id_md_external_accounts_id_fk" FOREIGN KEY ("external_account_id") REFERENCES "public"."md_external_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_session_metrics" ADD CONSTRAINT "md_session_metrics_session_id_md_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."md_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_session_metrics" ADD CONSTRAINT "md_session_metrics_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_sessions" ADD CONSTRAINT "md_sessions_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_sessions" ADD CONSTRAINT "md_sessions_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_setup_logs" ADD CONSTRAINT "md_setup_logs_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_setup_logs" ADD CONSTRAINT "md_setup_logs_session_id_md_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."md_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_sponsors" ADD CONSTRAINT "md_sponsors_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_square_connections" ADD CONSTRAINT "md_square_connections_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_subscription_events" ADD CONSTRAINT "md_subscription_events_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_team_analytics" ADD CONSTRAINT "md_team_analytics_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_team_members" ADD CONSTRAINT "md_team_members_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_telemetry_devices" ADD CONSTRAINT "md_telemetry_devices_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_telemetry_imports" ADD CONSTRAINT "md_telemetry_imports_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_telemetry_imports" ADD CONSTRAINT "md_telemetry_imports_device_id_md_telemetry_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."md_telemetry_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_terra_connections" ADD CONSTRAINT "md_terra_connections_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_training_plans" ADD CONSTRAINT "md_training_plans_client_id_md_coach_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."md_coach_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_vehicles" ADD CONSTRAINT "md_vehicles_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_video_analyses" ADD CONSTRAINT "md_video_analyses_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_video_analyses" ADD CONSTRAINT "md_video_analyses_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_video_analyses" ADD CONSTRAINT "md_video_analyses_linked_schedule_event_id_md_schedule_events_id_fk" FOREIGN KEY ("linked_schedule_event_id") REFERENCES "public"."md_schedule_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_webhook_logs" ADD CONSTRAINT "md_webhook_logs_webhook_id_md_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."md_webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_webhooks" ADD CONSTRAINT "md_webhooks_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_work_order_parts" ADD CONSTRAINT "md_work_order_parts_work_order_id_md_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."md_work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_work_order_parts" ADD CONSTRAINT "md_work_order_parts_part_vault_id_md_part_vault_id_fk" FOREIGN KEY ("part_vault_id") REFERENCES "public"."md_part_vault"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_work_order_photos" ADD CONSTRAINT "md_work_order_photos_work_order_id_md_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."md_work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_work_orders" ADD CONSTRAINT "md_work_orders_team_id_md_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."md_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_work_orders" ADD CONSTRAINT "md_work_orders_vehicle_id_md_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."md_vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;