(function exposeUiUtils(global) {
  function nextMuscleIndex(currentIndex, direction, length) {
    if (!length) return -1;
    if (direction === "first") return 0;
    if (direction === "last") return length - 1;
    if (currentIndex < 0) return direction === "previous" ? length - 1 : 0;
    return direction === "previous" ? (currentIndex - 1 + length) % length : (currentIndex + 1) % length;
  }

  function recoveryLabel(status) {
    if (status === "ready") return "ready to train";
    if (status === "needs_recovery") return "recovering";
    return "recovery status loading";
  }

  const api = { nextMuscleIndex, recoveryLabel };
  if (typeof module !== "undefined") module.exports = api;
  global.MuscleMapUtils = api;
})(typeof window === "undefined" ? globalThis : window);
