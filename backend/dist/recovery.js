// Product tuning values, deliberately centralised and independent of body weight.
export const RECOVERY_MODEL = { defaultRir: 2, readyDemand: 20, minimumRecoveryHours: 18, maximumRecoveryHours: 96, baselineSampleTarget: 5 };
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
/** Conservative Epley-style estimate: normal training reps only, with capped RIR. */
export function estimateSetStrength(set) {
    if (set.weightKg === null || set.weightKg <= 0 || set.reps === null || set.reps < 1)
        return null;
    const effectiveReps = clamp(set.reps + clamp(set.rir ?? RECOVERY_MODEL.defaultRir, 0, 5), 1, 12);
    return set.weightKg * (1 + effectiveReps / 30);
}
export function deriveStrengthBaseline(sets) {
    const estimates = sets.map(estimateSetStrength).filter((value) => value !== null);
    if (!estimates.length)
        return { strength: null, confidence: "low", sampleCount: 0 };
    // Median of the best few estimates prevents one unusual set defining a user.
    const representative = estimates.sort((a, b) => b - a).slice(0, RECOVERY_MODEL.baselineSampleTarget);
    return { strength: median(representative), confidence: estimates.length >= 6 ? "high" : estimates.length >= 2 ? "medium" : "low", sampleCount: estimates.length };
}
export function relativeIntensity(set, baselineStrength) {
    const estimate = estimateSetStrength(set);
    if (estimate === null)
        return 0;
    // New users get a conservative fallback until recorded performance establishes a baseline.
    return clamp(estimate / (baselineStrength ?? estimate / 0.85), 0.2, 1.2);
}
export function setStimulus(set, baselineStrength, loadFactor) {
    const intensity = relativeIntensity(set, baselineStrength);
    if (!intensity || set.reps === null)
        return 0;
    const effort = 0.55 + 0.45 * (1 - clamp(set.rir ?? RECOVERY_MODEL.defaultRir, 0, 5) / 5);
    return Math.pow(intensity, 1.35) * effort * Math.sqrt(clamp(set.reps, 1, 20) / 10) * clamp(loadFactor, 0.2, 1);
}
export const stimulusToDemand = (stimulus) => clamp(100 * (1 - Math.exp(-Math.max(0, stimulus) / 2)), 0, 100);
export function demandRecoveryHours(demand, defaultRecoveryHours = 72) {
    const target = clamp(defaultRecoveryHours, RECOVERY_MODEL.minimumRecoveryHours, RECOVERY_MODEL.maximumRecoveryHours);
    return RECOVERY_MODEL.minimumRecoveryHours + (target - RECOVERY_MODEL.minimumRecoveryHours) * clamp(demand, 0, 100) / 100;
}
export function recoveryDemandAt(demandAtTraining, trainedAt, recoveryHours, now = new Date()) {
    const elapsedHours = Math.max(0, now.getTime() - trainedAt.getTime()) / 36e5;
    return clamp(demandAtTraining * (1 - elapsedHours / recoveryHours), 0, 100);
}
export function calculateRecovery(lastTrainedAt, recoveryHours, now = new Date()) {
    if (!lastTrainedAt)
        return { status: "ready", recoveredAt: null };
    const recoveredAt = new Date(lastTrainedAt.getTime() + recoveryHours * 36e5);
    return { status: now < recoveredAt ? "needs_recovery" : "ready", recoveredAt };
}
export function buildMuscleRecovery(muscles, trainingSets, now = new Date()) {
    // A set is only compared with earlier performance for that exact exercise.
    // This stops the current workout (or a future PR) from rewriting its own score.
    const baselines = new Map();
    for (const set of trainingSets) {
        const priorSets = [...new Map(trainingSets
                .filter((candidate) => candidate.exerciseId === set.exerciseId && candidate.trainedAt < set.trainedAt)
                .map((candidate) => [candidate.setId, candidate])).values()];
        baselines.set(set.setId, deriveStrengthBaseline(priorSets));
    }
    return muscles.map((muscle) => {
        const sessions = new Map();
        for (const set of trainingSets.filter((candidate) => candidate.muscleSlug === muscle.slug)) {
            const baseline = baselines.get(set.setId);
            const session = sessions.get(set.workoutId) ?? { trainedAt: set.trainedAt, stimulus: 0, sets: [], intensities: [] };
            session.trainedAt = session.trainedAt > set.trainedAt ? session.trainedAt : set.trainedAt;
            session.stimulus += setStimulus(set, baseline.strength, set.loadFactor);
            session.sets.push(set);
            session.intensities.push(relativeIntensity(set, baseline.strength));
            sessions.set(set.workoutId, session);
        }
        const details = [...sessions.values()].map((session) => {
            const demand = stimulusToDemand(session.stimulus);
            const recoveryHours = demandRecoveryHours(demand, muscle.recoveryHours);
            return { ...session, demand, recoveryHours, remainingDemand: recoveryDemandAt(demand, session.trainedAt, recoveryHours, now) };
        });
        const recoveryDemand = 100 * (1 - details.reduce((remaining, session) => remaining * (1 - session.remainingDemand / 100), 1));
        const latest = details.sort((a, b) => b.trainedAt.getTime() - a.trainedAt.getTime())[0];
        const readyAt = details.length ? new Date(Math.max(...details.map((session) => session.trainedAt.getTime() + session.recoveryHours * 36e5))) : null;
        const recentSets = latest?.sets ?? [];
        const averageRir = recentSets.length ? recentSets.reduce((sum, set) => sum + (set.rir ?? RECOVERY_MODEL.defaultRir), 0) / recentSets.length : null;
        return {
            ...muscle, lastTrainedAt: latest?.trainedAt.toISOString() ?? null, recoveredAt: readyAt?.toISOString() ?? null, estimatedReadyAt: readyAt?.toISOString() ?? null,
            recoveryHours: latest?.recoveryHours ?? muscle.recoveryHours, recoveryDemand: Number(recoveryDemand.toFixed(1)), recoveryProgress: Number((1 - recoveryDemand / 100).toFixed(3)),
            status: recoveryDemand <= RECOVERY_MODEL.readyDemand ? "ready" : "needs_recovery", tension: latest ? Number((latest.demand / 100).toFixed(3)) : 0,
            trainingRole: recentSets.some((set) => set.role === "primary") ? "primary" : latest ? "secondary" : null, totalSets: recentSets.length,
            totalVolumeKg: Number(recentSets.reduce((sum, set) => sum + (set.weightKg ?? 0) * (set.reps ?? 0), 0).toFixed(2)), relativeIntensity: latest ? Number((latest.intensities.reduce((sum, value) => sum + value, 0) / latest.intensities.length).toFixed(2)) : null,
            averageRir: averageRir === null ? null : Number(averageRir.toFixed(1)), baselineConfidence: latest ? baselines.get(latest.sets[0].setId).confidence : "low",
            contributingExercises: [...new Set(recentSets.map((set) => set.exerciseName))],
        };
    });
}
