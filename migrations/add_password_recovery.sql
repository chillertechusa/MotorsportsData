-- Add password recovery fields to user table
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT,
ADD COLUMN IF NOT EXISTS "passwordResetTokenExpiresAt" TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_user_password_reset_token ON "user"("passwordResetToken");
