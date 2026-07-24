-- Migration 006: User moderation columns
-- Adds banned, ban_reason, banned_at, role to the Better Auth user table.
-- Safe to run multiple times (IF NOT EXISTS / DO NOTHING pattern).

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS banned         boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason     text,
  ADD COLUMN IF NOT EXISTS banned_at      timestamptz,
  ADD COLUMN IF NOT EXISTS role           varchar(20) DEFAULT 'user';
