-- Conservative cold-start estimates in hours; user history personalizes them when available.
update muscle_groups as mg
set default_recovery_hours = defaults.recovery_hours
from (values
  ('deltoids', 48),
  ('pectorals', 72),
  ('biceps', 48),
  ('forearms', 36),
  ('rectus-abdominis', 48),
  ('obliques', 48),
  ('hip-flexors', 60),
  ('adductors', 60),
  ('quadriceps', 72),
  ('trapezius', 60),
  ('rear-deltoids', 48),
  ('triceps', 48),
  ('rhomboids', 60),
  ('lats', 60),
  ('lower-back', 72),
  ('glutes', 72),
  ('hamstrings', 72),
  ('calves', 48)
) as defaults(slug, recovery_hours)
where mg.slug = defaults.slug;