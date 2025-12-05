CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'manager', 'viewer');--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;