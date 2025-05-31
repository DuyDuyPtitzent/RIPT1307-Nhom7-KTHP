export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const validateId = (id: string): boolean => {
  return !isNaN(parseInt(id));
};