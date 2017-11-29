-- ====  UP  ====
CREATE TABLE IF NOT EXISTS address_mapping(
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  address TEXT,
  ethereumAddress TEXT,
  signature TEXT,
  UNIQUE KEY signature (signature(100))
);

-- ==== DOWN ====
DROP TABLE address_mapping;
