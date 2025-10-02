export const FEES = {
  bookingPercentFree: 5,
  bookingPercentPro: 2.5
} as const;

export const CANCELLATION_POLICIES = {
  FLEX: "Full refund up to 24 hours before the event.",
  STANDARD: "50% refund available up to 72 hours before showtime.",
  STRICT: "Non-refundable within 7 days of the event."
} as const;

export const SAFETY_TIPS = [
  "Keep payment and communication on-platform for payout protection.",
  "Double-check event logistics before confirming travel or expenses.",
  "Report suspicious links, files, or off-platform payment requests."
] as const;
