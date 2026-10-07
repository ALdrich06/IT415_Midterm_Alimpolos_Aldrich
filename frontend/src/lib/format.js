/**
 * Format a number as Philippine Peso currency, e.g. 1234.5 -> "₱1,234.50"
 */
export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
