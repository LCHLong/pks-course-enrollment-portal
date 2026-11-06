export const formatDateVN = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
};
