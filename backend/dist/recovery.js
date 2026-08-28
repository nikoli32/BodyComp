export function calculateRecovery(lastTrainedAt, recoveryHours, now = new Date()) {
    if (!lastTrainedAt)
        return { status: "ready", recoveredAt: null };
    const recoveredAt = new Date(lastTrainedAt.getTime() + recoveryHours * 60 * 60 * 1000);
    return { status: now < recoveredAt ? "needs_recovery" : "ready", recoveredAt };
}
