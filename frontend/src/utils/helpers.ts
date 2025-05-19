export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const validateId = (id: string): boolean => {
  return !isNaN(parseInt(id));
};