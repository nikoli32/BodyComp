insert into exercises (name, instructions) values
  ('Barbell Back Squat', 'Squat to a comfortable depth with a controlled descent.'),
  ('Barbell Bench Press', 'Lower the bar with control, then press to lockout.'),
  ('Conventional Deadlift', 'Keep the bar close and stand by extending hips and knees.'),
  ('Pull-Up', 'Pull elbows toward the ribs while keeping the torso controlled.'),
  ('Overhead Press', 'Press overhead while maintaining a stable ribcage.'),
  ('Barbell Curl', 'Curl with controlled elbow flexion.'),
  ('Standing Calf Raise', 'Raise heels through a full comfortable range of motion.')
on conflict (name) do nothing;

insert into exercise_muscles (exercise_id, muscle_group_id, role, load_factor)
select e.id, mg.id, x.role, x.load_factor
from (values
  ('Barbell Back Squat', 'quadriceps', 'primary', 1.00), ('Barbell Back Squat', 'glutes', 'primary', 0.90), ('Barbell Back Squat', 'hamstrings', 'secondary', 0.50), ('Barbell Back Squat', 'lower-back', 'secondary', 0.45),
  ('Barbell Bench Press', 'pectorals', 'primary', 1.00), ('Barbell Bench Press', 'triceps', 'secondary', 0.70), ('Barbell Bench Press', 'deltoids', 'secondary', 0.45),
  ('Conventional Deadlift', 'glutes', 'primary', 1.00), ('Conventional Deadlift', 'hamstrings', 'primary', 0.90), ('Conventional Deadlift', 'lower-back', 'secondary', 0.75), ('Conventional Deadlift', 'trapezius', 'secondary', 0.40),
  ('Pull-Up', 'lats', 'primary', 1.00), ('Pull-Up', 'biceps', 'secondary', 0.65), ('Pull-Up', 'rhomboids', 'secondary', 0.55),
  ('Overhead Press', 'deltoids', 'primary', 1.00), ('Overhead Press', 'triceps', 'secondary', 0.65), ('Overhead Press', 'trapezius', 'secondary', 0.35),
  ('Barbell Curl', 'biceps', 'primary', 1.00), ('Barbell Curl', 'forearms', 'secondary', 0.65),
  ('Standing Calf Raise', 'calves', 'primary', 1.00)
) as x(exercise_name, muscle_slug, role, load_factor)
join exercises e on e.name = x.exercise_name
join muscle_groups mg on mg.slug = x.muscle_slug
on conflict (exercise_id, muscle_group_id) do nothing;
