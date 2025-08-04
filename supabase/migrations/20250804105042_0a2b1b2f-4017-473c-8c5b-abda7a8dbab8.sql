-- First, drop the constraint so we can update the data
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_position_check;

-- Update existing English positions to Portuguese
UPDATE players SET position = 'goleiro' WHERE position = 'goalkeeper';
UPDATE players SET position = 'zagueiro' WHERE position = 'defender';
UPDATE players SET position = 'meio-campo' WHERE position = 'midfielder';
UPDATE players SET position = 'atacante' WHERE position = 'forward';