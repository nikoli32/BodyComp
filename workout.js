(() => {
  const form = document.querySelector("#workoutForm");
  const picker = document.querySelector("#exercisePicker");
  const addExercise = document.querySelector("#addExercise");
  const exerciseList = document.querySelector("#workoutExercises");
  const emptyState = document.querySelector("#workoutEmpty");
  const finishButton = document.querySelector("#finishWorkout");
  const status = document.querySelector("#workoutStatus");
  const notes = document.querySelector("#workoutNotes");
  const workoutStartedAt = new Date().toISOString();
  let exercises = [];
  let workoutExercises = [];

  function setStatus(message, kind = "") {
    status.textContent = message;
    status.className = `form-status ${kind}`;
  }

  function addSet(exercise) {
    exercise.sets.push({ weightKg: "", reps: "", rir: "" });
    renderWorkout();
  }

  function addSelectedExercise() {
    const selected = exercises.find((exercise) => exercise.id === Number(picker.value));
    if (!selected) return;
    workoutExercises.push({ ...selected, localId: window.crypto?.randomUUID?.() || String(Date.now() + Math.random()), sets: [{ weightKg: "", reps: "", rir: "" }] });
    renderWorkout();
  }

  function renderWorkout() {
    exerciseList.innerHTML = "";
    emptyState.hidden = workoutExercises.length > 0;
    finishButton.disabled = workoutExercises.length === 0;
    workoutExercises.forEach((exercise) => {
      const card = document.createElement("section");
      card.className = "exercise-card";
      card.innerHTML = `
        <header class="exercise-card-header">
          <div><h3>${exercise.name}</h3><p>${exercise.muscles.map((muscle) => muscle.name).join(" · ")}</p></div>
          <button class="text-button remove-exercise" type="button">Remove</button>
        </header>
        <div class="set-table" role="group" aria-label="${exercise.name} sets">
          <div class="set-header"><span>Set</span><span>Weight (kg)</span><span>Reps</span><span>RIR</span><span></span></div>
          <div class="set-rows"></div>
        </div>
        <button class="text-button add-set" type="button">+ Add set</button>`;
      card.querySelector(".remove-exercise").addEventListener("click", () => {
        workoutExercises = workoutExercises.filter((item) => item.localId !== exercise.localId);
        renderWorkout();
      });
      card.querySelector(".add-set").addEventListener("click", () => addSet(exercise));
      const rows = card.querySelector(".set-rows");
      exercise.sets.forEach((set, index) => {
        const row = document.createElement("div");
        row.className = "set-row";
        row.innerHTML = `<span>${index + 1}</span><input aria-label="Set ${index + 1} weight in kilograms" type="number" min="0" step="0.5" value="${set.weightKg}" placeholder="Optional"><input aria-label="Set ${index + 1} repetitions" type="number" min="1" step="1" value="${set.reps}" required><input aria-label="Set ${index + 1} reps in reserve" type="number" min="0" max="10" step="1" value="${set.rir}" placeholder="Optional"><button class="remove-set" type="button" aria-label="Remove set ${index + 1}">×</button>`;
        const inputs = row.querySelectorAll("input");
        ["weightKg", "reps", "rir"].forEach((field, fieldIndex) => inputs[fieldIndex].addEventListener("input", (event) => { set[field] = event.target.value; }));
        row.querySelector(".remove-set").addEventListener("click", () => {
          exercise.sets.splice(index, 1);
          if (!exercise.sets.length) workoutExercises = workoutExercises.filter((item) => item.localId !== exercise.localId);
          renderWorkout();
        });
        rows.append(row);
      });
      exerciseList.append(card);
    });
  }

  function workoutPayload() {
    return {
      startedAt: workoutStartedAt,
      finishedAt: new Date().toISOString(),
      notes: notes.value.trim() || undefined,
      exercises: workoutExercises.map((exercise) => ({
        exerciseId: exercise.id,
        sets: exercise.sets.map((set) => ({
          weightKg: set.weightKg === "" ? undefined : Number(set.weightKg),
          reps: Number(set.reps),
          rir: set.rir === "" ? undefined : Number(set.rir),
          completedAt: new Date().toISOString(),
        })),
      })),
    };
  }

  async function loadExercises() {
    try {
      exercises = await window.MuscleRecoveryApi.getExercises();
      picker.innerHTML = '<option value="">Select an exercise</option>' + exercises.map((exercise) => `<option value="${exercise.id}">${exercise.name}</option>`).join("");
      picker.disabled = false;
      addExercise.disabled = false;
    } catch (error) {
      picker.innerHTML = "<option>Unable to load exercises</option>";
      setStatus(`Unable to load exercises. Start the API at ${window.MuscleRecoveryApi.apiBaseUrl}.`, "error");
      console.error(error);
    }
  }

  addExercise.addEventListener("click", addSelectedExercise);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !workoutExercises.length) return;
    finishButton.disabled = true;
    setStatus("Saving workout…");
    try {
      await window.MuscleRecoveryApi.createWorkout(workoutPayload());
      setStatus("Workout saved. Updating your recovery map…", "success");
      window.setTimeout(() => { window.location.assign("front_view.html?workoutSaved=1"); }, 650);
    } catch (error) {
      finishButton.disabled = false;
      setStatus(error.message || "Unable to save workout.", "error");
      console.error(error);
    }
  });

  loadExercises();
})();
