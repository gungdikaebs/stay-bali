export const CANCELLATION_ESCALATION_HOURS = 24;

export function getCancellationEscalationCutoff(now = new Date()) {
  return new Date(now.getTime() - CANCELLATION_ESCALATION_HOURS * 60 * 60 * 1000);
}

export function isCancellationEscalated(createdAt: Date, now = new Date()) {
  return createdAt <= getCancellationEscalationCutoff(now);
}
