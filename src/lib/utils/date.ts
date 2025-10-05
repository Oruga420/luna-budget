const pad = (value: number) => String(value).padStart(2, "0");

export const getMonthKey = (input: Date | string) => {
  const date = input instanceof Date ? input : new Date(input);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

export const normalizeToLocalISODate = (input: Date | string) => {
  const date = input instanceof Date ? input : new Date(input);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};
