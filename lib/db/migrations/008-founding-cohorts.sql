ALTER TABLE "md_founding_rigs"
  ADD COLUMN IF NOT EXISTS "cohort" varchar(30) NOT NULL DEFAULT 'founding_rig';

CREATE INDEX IF NOT EXISTS "md_founding_rigs_cohort_idx"
  ON "md_founding_rigs" ("cohort");
