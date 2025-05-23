export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const validateId = (id: string): boolean => {
  return !isNaN(parseInt(id));
};
export const vehicleTypeMap: Record<string, string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
  bicycle: 'Xe đạp',
  other: 'Khác',
};

export const getVehicleTypeName = (type: string): string => {
  return vehicleTypeMap[type] || type;
};
