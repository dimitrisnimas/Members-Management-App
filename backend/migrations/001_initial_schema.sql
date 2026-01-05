-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  fathers_name VARCHAR(100),
  id_number VARCHAR(50),
  phone VARCHAR(50),
  address TEXT,
  role VARCHAR(20) DEFAULT 'user', -- 'superadmin', 'user'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  member_type VARCHAR(50), -- 'Τακτικό', 'Υποστηρικτής'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by INTEGER REFERENCES users(id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  member_type VARCHAR(50) NOT NULL, -- 'Τακτικό', 'Υποστηρικτής'
  duration_months INTEGER NOT NULL, -- 1, 3, 6, 9, 12
  price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  auto_renew BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'bank_transfer', 'stripe'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  stripe_payment_id VARCHAR(255),
  payment_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action History table
CREATE TABLE IF NOT EXISTS action_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  performed_by INTEGER REFERENCES users(id),
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exist
INSERT INTO system_settings (setting_key, setting_value) 
VALUES 
  ('bank_accounts', '{"accounts": [{"bank": "Bank Name", "iban": "GR...", "holder": "Organization Name"}]}'),
  ('pricing_taktiko_1m', '50.00'),
  ('pricing_taktiko_3m', '140.00'),
  ('pricing_taktiko_6m', '270.00'),
  ('pricing_taktiko_9m', '390.00'),
  ('pricing_taktiko_12m', '500.00'),
  ('pricing_ypostiriktis_1m', '30.00'),
  ('pricing_ypostiriktis_3m', '85.00'),
  ('pricing_ypostiriktis_6m', '160.00'),
  ('pricing_ypostiriktis_9m', '230.00'),
  ('pricing_ypostiriktis_12m', '300.00')
ON CONFLICT (setting_key) DO NOTHING;
