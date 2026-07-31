ALTER TABLE "user" ADD COLUMN "twoFactorEnabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "passwordResetToken" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "passwordResetTokenExpiresAt" timestamp;