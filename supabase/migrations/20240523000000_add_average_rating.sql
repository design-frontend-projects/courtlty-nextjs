-- Create a function to calculate the average rating for a court
-- This function can be used as a computed field: .select('*, average_rating')
CREATE OR REPLACE FUNCTION average_rating(court_row courts)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT ROUND(AVG(rating)::numeric, 1)
  FROM reviews
  WHERE court_id = court_row.id;
$$;
