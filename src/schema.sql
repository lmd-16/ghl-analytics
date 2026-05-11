DROP DATABASE IF EXISTS ghl_analytics;
CREATE DATABASE ghl_analytics;
USE ghl_analytics;

CREATE TABLE business (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    industry VARCHAR(50),
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE
);

CREATE TABLE campaign (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE
);

CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    f_name VARCHAR(50) NOT NULL,
    l_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(50),
    ghl_id INT NOT NULL,
    campaign_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lead_status VARCHAR(50) DEFAULT 'new',
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    lead_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(50),
    ghl_appointment_id INT NOT NULL,
    campaign_id INT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    appt_status VARCHAR(50),
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE
);

CREATE TABLE spend_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    source VARCHAR(50),
    spend_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount INT NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE
);


CREATE TABLE alert_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    campaign_id INT NOT NULL,
    metric_name INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE
);


CREATE TABLE alerts(
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    threshold VARCHAR(50),
    rule_id INT NOT NULL,
    metric INT NOT NULL,
    actual_value DECIMAL(10,2),
    campaign_id INT NOT NULL,
    resolved BOOLEAN,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE
);

CREATE TABLE ai_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    question TEXT NOT NULL,
    generated_sql TEXT,
    error_msg TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    response_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE

);

CREATE TABLE closed_deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    bus_id INT NOT NULL,
    ghl_opp_id INT NOT NULL,
    lead_id INT NOT NULL,
    deal_value INT NOT NULL,
    lifetime_value INT, 
    close_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE webhook_logs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    event_type VARCHAR(100),
    payload JSON,
    processed BOOLEAN DEFAULT FALSE,
    error_msg TEXT,
    recieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES business(id) ON DELETE CASCADE
);