export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string = "es-MX",
) => {
  if (!Number.isFinite(amount)) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (value: number, maximumFractionDigits = 0) => {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    maximumFractionDigits,
  }).format(value);
};
