ALTER TABLE responses ADD COLUMN answer_number INTEGER;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) + 1 AS assigned_number
  FROM responses
  WHERE is_public = 1
)
UPDATE responses
SET answer_number = (
  SELECT assigned_number FROM numbered WHERE numbered.id = responses.id
)
WHERE is_public = 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_answer_number
  ON responses(answer_number)
  WHERE answer_number IS NOT NULL;

CREATE TRIGGER IF NOT EXISTS assign_public_answer_number
AFTER INSERT ON responses
WHEN NEW.is_public = 1 AND NEW.answer_number IS NULL
BEGIN
  UPDATE responses
  SET answer_number = COALESCE(
    (SELECT MAX(answer_number) + 1 FROM responses WHERE id <> NEW.id AND answer_number IS NOT NULL),
    2
  )
  WHERE id = NEW.id;
END;
