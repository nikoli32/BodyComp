(() => {
  const list = document.querySelector("#workoutHistory");
  const status = document.querySelector("#historyStatus");
  let workouts = [];

  function setStatus(message, kind = "") {
    status.textContent = message;
    status.className = `form-status ${kind}`;
  }

  function formatDate(value) {
    return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function workoutPayload(workout) {
    return {
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt || new Date().toISOString(),
      notes: (workout.notes || "").trim() || undefined,
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: Number(exercise.exerciseId),
        sets: exercise.sets.map((set) => ({
          weightKg: Number(set.weightKg),
          reps: Number(set.reps),
          rir: set.rir === "" || set.rir === null ? undefined : Number(set.rir),
          completedAt: workout.finishedAt || new Date().toISOString(),
        })),
      })),
    };
  }

  function isValid(workout) {
    return workout.exercises.every((exercise) => exercise.sets.every((set) => (
      Number.isFinite(Number(set.weightKg)) && Number(set.weightKg) >= 0
      && Number.isInteger(Number(set.reps)) && Number(set.reps) > 0
      && (set.rir === "" || set.rir === null || (Number.isInteger(Number(set.rir)) && Number(set.rir) >= 0 && Number(set.rir) <= 10))
    )));
  }

  function render() {
    list.innerHTML = "";
    if (!workouts.length) {
      list.innerHTML = '<p class="empty-state">No workouts saved yet. Log a workout to see it here.</p>';
      return;
    }
    workouts.forEach((workout) => {
      const card = document.createElement("article");
      card.className = "exercise-card history-card";
      card.innerHTML = `<header class="exercise-card-header"><div><h3>${formatDate(workout.startedAt)}</h3><p>${workout.exercises.length} exercise${workout.exercises.length === 1 ? "" : "s"}</p></div><button class="button save-history" type="button">Save changes</button></header><label class="notes-field">Workout notes<textarea class="history-notes" maxlength="2000" placeholder="Optional notes"></textarea></label><div class="history-exercises"></div><p class="form-status history-status" role="status"></p>`;
      card.querySelector(".history-notes").value = workout.notes || "";
      card.querySelector(".history-notes").addEventListener("input", (event) => { workout.notes = event.target.value; });
      const exercises = card.querySelector(".history-exercises");
      workout.exercises.forEach((exercise) => {
        const section = document.createElement("section");
        section.className = "history-exercise";
        section.innerHTML = `<h4>${exercise.name}</h4><div class="set-table"><div class="set-header"><span>Set</span><span>Weight (kg)</span><span>Reps</span><span>RIR</span></div><div class="set-rows"></div></div>`;
        const rows = section.querySelector(".set-rows");
        exercise.sets.forEach((set, index) => {
          const row = document.createElement("div");
          row.className = "set-row history-set-row";
          row.innerHTML = `<span>${index + 1}</span><input type="number" min="0" step="0.5" required aria-label="${exercise.name} set ${index + 1} weight in kilograms"><input type="number" min="1" step="1" required aria-label="${exercise.name} set ${index + 1} reps"><input type="number" min="0" max="10" step="1" aria-label="${exercise.name} set ${index + 1} RIR"></div>`;
          const inputs = row.querySelectorAll("input");
          inputs[0].value = set.weightKg;
          inputs[1].value = set.reps;
          inputs[2].value = set.rir ?? "";
          ["weightKg", "reps", "rir"].forEach((field, fieldIndex) => inputs[fieldIndex].addEventListener("input", (event) => { set[field] = event.target.value; }));
          rows.append(row);
        });
        exercises.append(section);
      });
      card.querySelector(".save-history").addEventListener("click", async () => {
        const cardStatus = card.querySelector(".history-status");
        if (!isValid(workout)) {
          cardStatus.textContent = "Enter a valid weight, rep count, and RIR (0–10) for every set.";
          cardStatus.className = "form-status history-status error";
          return;
        }
        const button = card.querySelector(".save-history");
        button.disabled = true;
        cardStatus.textContent = "Saving changes...";
        cardStatus.className = "form-status history-status";
        try {
          await window.MuscleRecoveryApi.updateWorkout(workout.id, workoutPayload(workout));
          cardStatus.textContent = "Workout updated. Recovery map data has been recalculated.";
          cardStatus.className = "form-status history-status success";
        } catch (error) {
          button.disabled = false;
          cardStatus.textContent = error.message || "Unable to save changes.";
          cardStatus.className = "form-status history-status error";
        }
      });
      list.append(card);
    });
  }

  async function load() {
    try {
      workouts = await window.MuscleRecoveryApi.getWorkouts();
      setStatus("");
      render();
    } catch (error) {
      setStatus(error.message || "Unable to load workout history.", "error");
    }
  }

  load();
})();
