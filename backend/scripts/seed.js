const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

// Product-level fields only: each product has its own name, price, category, description, nutritional_info, etc.
const sampleProducts = [
  {
    name: "Organic Apples",
    price: 3.99,
    brand: "Fresh Farms",
    category: "Fruits",
    description: "Crisp, sweet organic apples perfect for snacking or baking. Grown without synthetic pesticides.",
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    stock_quantity: 50,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 52,
        "proteins_100g": 0.3,
        "carbohydrates_100g": 14,
        "fat_100g": 0.2,
        "fiber_100g": 2.4,
        "sugars_100g": 10,
      },
      nutriscore_grade: "a",
    },
  },
  {
    name: "Whole Wheat Bread",
    price: 2.49,
    brand: "Bakery Fresh",
    category: "Bakery",
    description: "Hearty whole wheat loaf baked fresh daily. High in fiber and ideal for sandwiches or toast.",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    stock_quantity: 30,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 247,
        "proteins_100g": 13,
        "carbohydrates_100g": 41,
        "fat_100g": 4.2,
        "fiber_100g": 7,
        "sugars_100g": 6,
      },
      nutriscore_grade: "b",
    },
  },
  {
    name: "Organic Milk",
    price: 4.99,
    brand: "Dairy Pure",
    category: "Dairy",
    description: "Fresh organic milk from grass-fed cows. Rich in calcium and vitamin D.",
    image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    stock_quantity: 25,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 61,
        "proteins_100g": 3.2,
        "carbohydrates_100g": 4.8,
        "fat_100g": 3.3,
        "sugars_100g": 4.8,
      },
      nutriscore_grade: "b",
    },
  },
  {
    name: "Fresh Spinach",
    price: 2.99,
    brand: "Green Valley",
    category: "Vegetables",
    description: "Tender leafy spinach, great for salads, smoothies, or cooked dishes. Packed with iron and vitamins.",
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
    stock_quantity: 40,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 23,
        "proteins_100g": 2.9,
        "carbohydrates_100g": 3.6,
        "fat_100g": 0.4,
        "fiber_100g": 2.2,
        "sugars_100g": 0.4,
      },
      nutriscore_grade: "a",
    },
  },
  {
    name: "Greek Yogurt",
    price: 5.49,
    brand: "Creamy Delight",
    category: "Dairy",
    description: "Thick, creamy Greek yogurt with live cultures. High in protein and perfect for breakfast or snacks.",
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    stock_quantity: 35,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 59,
        "proteins_100g": 10,
        "carbohydrates_100g": 3.6,
        "fat_100g": 0.4,
        "sugars_100g": 3.6,
      },
      nutriscore_grade: "a",
    },
  },
  {
    name: "Chicken Breast",
    price: 8.99,
    brand: "Farm Fresh",
    category: "Meat",
    description: "Lean, skinless chicken breast. High in protein and versatile for grilling, baking, or stir-frying.",
    image_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
    stock_quantity: 20,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 165,
        "proteins_100g": 31,
        "carbohydrates_100g": 0,
        "fat_100g": 3.6,
      },
      nutriscore_grade: "b",
    },
  },
  {
    name: "Brown Rice",
    price: 3.49,
    brand: "Golden Grain",
    category: "Grains",
    description: "Whole grain brown rice with a nutty flavor. Good source of fiber and minerals.",
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    stock_quantity: 45,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 111,
        "proteins_100g": 2.6,
        "carbohydrates_100g": 23,
        "fat_100g": 0.9,
        "fiber_100g": 1.8,
      },
      nutriscore_grade: "b",
    },
  },
  {
    name: "Salmon Fillet",
    price: 12.99,
    brand: "Ocean Fresh",
    category: "Seafood",
    description: "Fresh Atlantic salmon fillet, rich in omega-3 fatty acids. Perfect for baking or pan-searing.",
    image_url: "https://images.unsplash.com/photo-1544943910-04c1e2c5e4b6?w=400",
    stock_quantity: 15,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 208,
        "proteins_100g": 20,
        "carbohydrates_100g": 0,
        "fat_100g": 12,
      },
      nutriscore_grade: "b",
    },
  },
  {
    name: "Bananas",
    price: 1.99,
    brand: "Tropical",
    category: "Fruits",
    description: "Ripe, sweet bananas. Great for eating fresh, in smoothies, or for baking.",
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    stock_quantity: 60,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 89,
        "proteins_100g": 1.1,
        "carbohydrates_100g": 23,
        "fat_100g": 0.3,
        "fiber_100g": 2.6,
        "sugars_100g": 12,
      },
      nutriscore_grade: "a",
    },
  },
  {
    name: "Olive Oil",
    price: 7.99,
    brand: "Mediterranean",
    category: "Oils",
    description: "Extra virgin olive oil, cold-pressed. Ideal for dressings, cooking, and dipping.",
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd8692?w=400",
    stock_quantity: 28,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 884,
        "proteins_100g": 0,
        "carbohydrates_100g": 0,
        "fat_100g": 100,
      },
      nutriscore_grade: "c",
    },
  },
  {
    name: "Tomatoes",
    price: 2.79,
    brand: "Garden Fresh",
    category: "Vegetables",
    description: "Vine-ripened tomatoes, perfect for salads, sauces, or slicing. A kitchen staple.",
    image_url: "https://images.unsplash.com/photo-1546470427-e26264be0b2b?w=400",
    stock_quantity: 55,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 18,
        "proteins_100g": 0.9,
        "carbohydrates_100g": 3.9,
        "fat_100g": 0.2,
        "fiber_100g": 1.2,
        "sugars_100g": 2.6,
      },
      nutriscore_grade: "a",
    },
  },
  {
    name: "Eggs (Dozen)",
    price: 4.49,
    brand: "Farm Fresh",
    category: "Dairy",
    description: "Farm-fresh eggs, a dozen. Excellent source of protein and essential nutrients.",
    image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
    stock_quantity: 38,
    nutritional_info: {
      nutriments: {
        "energy-kcal_100g": 155,
        "proteins_100g": 13,
        "carbohydrates_100g": 1.1,
        "fat_100g": 11,
      },
      nutriscore_grade: "b",
    },
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Create Manager Account
    console.log("👤 Creating manager account...");
    const managerPassword = await bcrypt.hash("manager123", 10);
    const [managerResult] = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=email`,
      ["manager@oopshop.com", managerPassword, "John", "Manager", "manager", true]
    );
    console.log("✅ Manager account created:");
    console.log("   Email: manager@oopshop.com");
    console.log("   Password: manager123\n");

    // Create Customer Account
    console.log("👤 Creating customer account...");
    const customerPassword = await bcrypt.hash("customer123", 10);
    const [customerResult] = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, billing_street, billing_zip, billing_city, billing_country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=email`,
      [
        "customer@oopshop.com",
        customerPassword,
        "Jane",
        "Customer",
        "+1234567890",
        "customer",
        true,
        "123 Main Street",
        "12345",
        "New York",
        "USA",
      ]
    );
    console.log("✅ Customer account created:");
    console.log("   Email: customer@oopshop.com");
    console.log("   Password: customer123\n");

    // Create Products
    console.log("📦 Creating products...");
    let productsCreated = 0;
    let productsSkipped = 0;

    for (const product of sampleProducts) {
      try {
        const [existing] = await pool.query(
          "SELECT id FROM products WHERE name = ? AND brand = ?",
          [product.name, product.brand]
        );

        if (existing.length > 0) {
          productsSkipped++;
          continue;
        }

        await pool.query(
          `INSERT INTO products (name, price, brand, image_url, category, description, nutritional_info, stock_quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.price,
            product.brand,
            product.image_url,
            product.category,
            product.description || null,
            JSON.stringify(product.nutritional_info),
            product.stock_quantity,
          ]
        );
        productsCreated++;
        console.log(`   ✓ ${product.name} - €${product.price}`);
      } catch (err) {
        console.error(`   ✗ Error creating ${product.name}:`, err.message);
      }
    }

    // Backfill description for existing products that have none (product-level only)
    let descriptionsUpdated = 0;
    for (const product of sampleProducts) {
      if (!product.description) continue;
      const [updateResult] = await pool.query(
        `UPDATE products SET description = ? WHERE name = ? AND brand = ? AND (description IS NULL OR description = '')`,
        [product.description, product.name, product.brand]
      );
      if (updateResult.affectedRows > 0) descriptionsUpdated += updateResult.affectedRows;
    }
    if (descriptionsUpdated > 0) {
      console.log(`   Descriptions backfilled: ${descriptionsUpdated} existing product(s)\n`);
    }

    console.log(`\n✅ Products seeding completed:`);
    console.log(`   Created: ${productsCreated}`);
    console.log(`   Skipped (already exist): ${productsSkipped}\n`);

    // Summary
    console.log("📊 Seeding Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Manager Account:");
    console.log("   Email: manager@oopshop.com");
    console.log("   Password: manager123");
    console.log("   Access: /login (dashboard)");
    console.log("");
    console.log("✅ Customer Account:");
    console.log("   Email: customer@oopshop.com");
    console.log("   Password: customer123");
    console.log("   Access: /signin (shop)");
    console.log("");
    console.log(`✅ Products: ${productsCreated} products added`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🎉 Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

// Run seeding
seedDatabase();

