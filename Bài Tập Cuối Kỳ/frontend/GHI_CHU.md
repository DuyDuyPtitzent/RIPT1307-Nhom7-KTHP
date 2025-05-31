CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  avatar_path VARCHAR(255),
  rental_start_date DATETIME,
  rental_duration_months INT,
  extension_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE residents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  apartment_number VARCHAR(50) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);
ALTER TABLE users
ADD COLUMN resident_id INT,
ADD FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE invoices
ADD COLUMN invoice_number VARCHAR(255) UNIQUE NULL, -- Thêm số hóa đơn (VARCHAR) và có thể là UNIQUE nếu mỗi hóa đơn có một số duy nhất
ADD COLUMN number_of_people INT NULL,            -- Số người (kiểu số nguyên)
ADD COLUMN room_price DECIMAL(10, 2) NULL,       -- Giá phòng (kiểu số thập phân với 10 chữ số tổng cộng, 2 chữ số sau dấu thập phân)
ADD COLUMN electricity_start DECIMAL(10, 2) NULL, -- Số điện đầu (kiểu số thập phân)
ADD COLUMN electricity_end DECIMAL(10, 2) NULL,   -- Số điện cuối (kiểu số thập phân)
ADD COLUMN electricity_rate DECIMAL(10, 2) NULL,  -- Giá điện (kiểu số thập phân)
ADD COLUMN water_start DECIMAL(10, 2) NULL,       -- Số nước đầu (kiểu số thập phân)
ADD COLUMN water_end DECIMAL(10, 2) NULL,         -- Số nước cuối (kiểu số thập phân)
ADD COLUMN water_rate DECIMAL(10, 2) NULL,        -- Giá nước (kiểu số thập phân)
ADD COLUMN internet_fee DECIMAL(10, 2) NULL,      -- Phí internet (kiểu số thập phân)
ADD COLUMN service_fee_per_person DECIMAL(10, 2) NULL; -- Phí dịch vụ mỗi người (kiểu số thập phân)