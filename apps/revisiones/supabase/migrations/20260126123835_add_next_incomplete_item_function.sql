/*
  # Add function to get next incomplete checklist item

  1. Creates a PostgreSQL function to find the next incomplete item for a review
  2. Returns -1, -1 if all items are complete
  3. Moves navigation logic to database for efficiency
*/

CREATE OR REPLACE FUNCTION get_next_incomplete_item(p_review_id UUID)
RETURNS TABLE (item_found BOOLEAN, item_key TEXT) AS $$
DECLARE
  v_first_incomplete_key TEXT;
BEGIN
  SELECT COALESCE(ci.item_key, NULL) INTO v_first_incomplete_key
  FROM (
    SELECT DISTINCT item_key FROM checklist_items
    WHERE review_id = p_review_id
    ORDER BY order_index ASC
  ) saved_items
  RIGHT JOIN (
    SELECT 'ext_paint'::TEXT UNION ALL
    SELECT 'ext_trim' UNION ALL
    SELECT 'int_seats'
  ) all_items(item_key) ON saved_items.item_key = all_items.item_key
  LEFT JOIN checklist_items ci ON ci.item_key = all_items.item_key 
    AND ci.review_id = p_review_id 
    AND ci.value IS NOT NULL AND ci.value != ''
  WHERE saved_items.item_key IS NULL
  OR ci.id IS NULL
  LIMIT 1;

  IF v_first_incomplete_key IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, v_first_incomplete_key;
  ELSE
    RETURN QUERY SELECT FALSE, NULL;
  END IF;
END;
$$ LANGUAGE PLPGSQL STABLE;