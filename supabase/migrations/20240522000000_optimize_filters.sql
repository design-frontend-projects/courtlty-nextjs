-- Migration to add RPC functions for optimizing filters

-- Function to get unique cities from active courts
CREATE OR REPLACE FUNCTION get_unique_cities()
RETURNS TABLE (city text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT city
  FROM courts
  WHERE is_active = true
  AND city IS NOT NULL
  AND city <> ''
  ORDER BY city;
$$;

-- Function to get unique sports from active courts
CREATE OR REPLACE FUNCTION get_unique_sports()
RETURNS TABLE (sport text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT unnest(sports) as sport
  FROM courts
  WHERE is_active = true
  ORDER BY sport;
$$;
