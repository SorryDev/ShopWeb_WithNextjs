CREATE TABLE IF NOT EXISTS topup_requests (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  points INT NOT NULL,
  payment_method ENUM('bank_transfer', 'true_wallet') NOT NULL,
  proof_image VARCHAR(255),
  transaction_date DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

