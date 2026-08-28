-- Calf regions are represented on the rear anatomy map only.
update muscle_groups
set map_view = 'back'
where slug = 'calves';
