import React from 'react';
import SearchBar from '../../components/SearchBar';
import useVehicleModel from '../../models/vehicles';

const VehicleSearch: React.FC = () => {
  const { setSearch, fetchVehicles } = useVehicleModel();

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchVehicles();
  };

  return (
    <SearchBar
      onSearch={handleSearch}
      placeholder="Tìm kiếm theo biển số hoặc chủ sở hữu"
    />
  );
};

export default VehicleSearch;