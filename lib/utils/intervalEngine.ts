import { addMonths, differenceInDays, isBefore } from "date-fns";

export type VisitFrequency = "monthly" | "quarterly" | "half-yearly" | "yearly";

export function getFrequencyMonths(freq: VisitFrequency): number {
  switch (freq) {
    case "monthly": return 1;
    case "quarterly": return 3;
    case "half-yearly": return 6;
    case "yearly": return 12;
    default: return 0;
  }
}

export function computeCurrentInterval(
  amcStartDate: Date,
  amcPeriodMonths: number,
  frequency: VisitFrequency,
  referenceDate: Date = new Date()
) {
  const amcEndDate = addMonths(amcStartDate, amcPeriodMonths);
  if (isBefore(amcEndDate, referenceDate)) {
    return null; // AMC expired
  }

  const freqMonths = getFrequencyMonths(frequency);
  if (freqMonths === 0) return null;

  let currentStart = new Date(amcStartDate);
  let currentEnd = addMonths(currentStart, freqMonths);

  // Step forward interval by interval
  while (isBefore(currentEnd, referenceDate)) {
    currentStart = currentEnd;
    currentEnd = addMonths(currentStart, freqMonths);
  }

  // Cap at AMC end date
  if (isBefore(amcEndDate, currentEnd)) {
    currentEnd = amcEndDate;
  }

  const daysToEnd = differenceInDays(currentEnd, referenceDate);

  return {
    intervalStart: currentStart,
    intervalEnd: currentEnd,
    daysToEnd,
  };
}
