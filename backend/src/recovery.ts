export type RecoveryStatus = "ready" | "needs_recovery";

export function calculateRecovery(lastTrainedAt: Date | null, recoveryHours: number, now = new Date()): {
  status: RecoveryStatus;
  recoveredAt: Date | null;
} {
  if (!lastTrainedAt) return { status: "ready", recoveredAt: null };
  const recoveredAt = new Date(lastTrainedAt.getTime() + recoveryHours * 60 * 60 * 1000);
  return { status: now < recoveredAt ? "needs_recovery" : "ready", recoveredAt };
}
