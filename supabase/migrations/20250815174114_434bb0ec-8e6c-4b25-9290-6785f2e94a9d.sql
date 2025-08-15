-- Check the constraint on match_media table
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'match_media'::regclass
AND contype = 'c';