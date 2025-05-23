import React from 'react';
import { Input } from 'antd';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Tìm kiếm...', style }) => {
  return (
    <Input.Search
      placeholder={placeholder}
      onSearch={onSearch}
      style={{ width: 300, ...style }}
      allowClear
    />
  );
};

export default SearchBar;