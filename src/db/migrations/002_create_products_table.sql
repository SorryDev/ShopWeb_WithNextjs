CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points INT NOT NULL,
  image VARCHAR(255) NOT NULL,
  video_url VARCHAR(255),
  version VARCHAR(20) NOT NULL,
  details TEXT,
  requirements TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

