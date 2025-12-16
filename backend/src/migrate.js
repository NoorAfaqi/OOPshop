const pool = require("./db");

async function runMigrations() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS managers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        billing_street VARCHAR(255),
        billing_zip VARCHAR(20),
        billing_city VARCHAR(100),
        billing_country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        brand VARCHAR(255),
        image_url VARCHAR(500),
        category VARCHAR(255),
        nutritional_info JSON,
        stock_quantity INT NOT NULL DEFAULT 0,
        open_food_facts_barcode VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending','paid','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_invoices_customer
          FOREIGN KEY (customer_id) REFERENCES customers(id)
          ON DELETE RESTRICT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_items_invoice
          FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_items_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE RESTRICT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        customer_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method ENUM('paypal','card','cash','other') DEFAULT 'paypal',
        status ENUM('pending','completed','failed') DEFAULT 'pending',
        paypal_transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_payments_invoice
          FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_payments_customer
          FOREIGN KEY (customer_id) REFERENCES customers(id)
          ON DELETE RESTRICT
      )
    `);

    // eslint-disable-next-line no-console
    console.log("Migrations completed successfully.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Migration error:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();


