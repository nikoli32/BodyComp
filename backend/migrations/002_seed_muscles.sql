insert into muscle_groups (slug, name, description, map_view) values
  ('deltoids', 'Deltoids', 'Shoulder abduction and pressing control.', 'both'),
  ('pectorals', 'Pectorals', 'Primary chest muscles for pressing and shoulder flexion.', 'front'),
  ('biceps', 'Biceps', 'Front upper-arm flexors used in curls and pulling work.', 'front'),
  ('forearms', 'Forearms', 'Grip and wrist control muscles.', 'front'),
  ('rectus-abdominis', 'Rectus Abdominis', 'Central abdominal wall used for bracing.', 'front'),
  ('obliques', 'Obliques', 'Side abdominal stabilizer muscles.', 'front'),
  ('hip-flexors', 'Hip Flexors', 'Anterior hip muscles involved in knee drive.', 'front'),
  ('adductors', 'Adductors', 'Inner thigh muscles.', 'front'),
  ('quadriceps', 'Quadriceps', 'Front thigh muscles used for knee extension.', 'front'),
  ('trapezius', 'Trapezius', 'Upper-back muscle used in shrugs and rows.', 'back'),
  ('rear-deltoids', 'Rear Deltoids', 'Back shoulder muscles.', 'back'),
  ('triceps', 'Triceps', 'Back upper-arm muscles used in presses.', 'back'),
  ('rhomboids', 'Rhomboids', 'Muscles between the shoulder blades.', 'back'),
  ('lats', 'Lats', 'Large back muscles used in pulling.', 'back'),
  ('lower-back', 'Lower Back', 'Spinal support muscles.', 'back'),
  ('glutes', 'Glutes', 'Hip extensor muscles.', 'back'),
  ('hamstrings', 'Hamstrings', 'Back thigh muscles.', 'back'),
  ('calves', 'Calves', 'Lower-leg muscles.', 'back')
on conflict (slug) do nothing;

insert into muscle_regions (muscle_group_id, region_key, side, map_view)
select mg.id, r.region_key, r.side, r.map_view
from (values
  ('deltoids', 'leftDeltoid', 'left', 'front'), ('deltoids', 'rightDeltoid', 'right', 'front'),
  ('pectorals', 'leftPec', 'left', 'front'), ('pectorals', 'rightPec', 'right', 'front'),
  ('biceps', 'leftBiceps', 'left', 'front'), ('biceps', 'rightBiceps', 'right', 'front'),
  ('forearms', 'leftForearm', 'left', 'front'), ('forearms', 'rightForearm', 'right', 'front'),
  ('rectus-abdominis', 'leftUpperAbs', 'left', 'front'), ('rectus-abdominis', 'rightUpperAbs', 'right', 'front'),
  ('rectus-abdominis', 'leftMidAbs', 'left', 'front'), ('rectus-abdominis', 'rightMidAbs', 'right', 'front'),
  ('rectus-abdominis', 'leftLowerAbs', 'left', 'front'), ('rectus-abdominis', 'rightLowerAbs', 'right', 'front'),
  ('obliques', 'leftOblique', 'left', 'front'), ('obliques', 'rightOblique', 'right', 'front'),
  ('hip-flexors', 'leftHipFlexor', 'left', 'front'), ('hip-flexors', 'rightHipFlexor', 'right', 'front'),
  ('adductors', 'leftAdductor', 'left', 'front'), ('adductors', 'rightAdductor', 'right', 'front'),
  ('quadriceps', 'leftQuadOuter', 'left', 'front'), ('quadriceps', 'leftQuadInner', 'left', 'front'),
  ('quadriceps', 'rightQuadOuter', 'right', 'front'), ('quadriceps', 'rightQuadInner', 'right', 'front'),
  ('trapezius', 'leftTrap', 'left', 'back'), ('trapezius', 'rightTrap', 'right', 'back'),
  ('rear-deltoids', 'leftRearDelt', 'left', 'back'), ('rear-deltoids', 'rightRearDelt', 'right', 'back'),
  ('triceps', 'leftTricep', 'left', 'back'), ('triceps', 'rightTricep', 'right', 'back'),
  ('rhomboids', 'leftUpperBack', 'left', 'back'), ('rhomboids', 'rightUpperBack', 'right', 'back'),
  ('lats', 'leftLat', 'left', 'back'), ('lats', 'rightLat', 'right', 'back'),
  ('lower-back', 'leftLowerBack', 'left', 'back'), ('lower-back', 'rightLowerBack', 'right', 'back'),
  ('glutes', 'leftGlute', 'left', 'back'), ('glutes', 'rightGlute', 'right', 'back'),
  ('hamstrings', 'leftHamstring', 'left', 'back'), ('hamstrings', 'rightHamstring', 'right', 'back'),
  ('calves', 'leftCalf', 'left', 'back'), ('calves', 'rightCalf', 'right', 'back')
) as r(muscle_slug, region_key, side, map_view)
join muscle_groups mg on mg.slug = r.muscle_slug
on conflict (region_key) do nothing;
