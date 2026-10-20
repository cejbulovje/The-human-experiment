ALTER TABLE responses ADD COLUMN q2_other TEXT CHECK (q2_other IS NULL OR length(q2_other) <= 500);
ALTER TABLE responses ADD COLUMN q3_other TEXT CHECK (q3_other IS NULL OR length(q3_other) <= 500);
ALTER TABLE responses ADD COLUMN q4_other TEXT CHECK (q4_other IS NULL OR length(q4_other) <= 500);
