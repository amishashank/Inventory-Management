import axios from 'axios';

const API_URL = 'http://127.0.0.1:8081/api';

async function seedData() {
  try {
    // 1. Register a user (or login if exists)
    let token;
    let user;
    try {
      console.log('Registering user...');
      const regRes = await axios.post(`${API_URL}/auth/register`, {
        shopName: 'SuperMart',
        email: 'supermart@example.com',
        password: 'password123',
        phone: '1234567890'
      });
      token = regRes.data.token;
      user = regRes.data.user;
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('User already exists, logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: 'supermart@example.com',
          password: 'password123'
        });
        token = loginRes.data.token;
        user = loginRes.data;
      } else {
        throw err;
      }
    }

    console.log('Logged in successfully. Token length:', token.length);

    const authConfig = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Create Categories
    const categoriesToCreate = [
      { name: 'Electronics', description: 'Gadgets and electronic items' },
      { name: 'Groceries', description: 'Daily essential groceries' },
      { name: 'Clothing', description: 'Apparel and fashion' },
      { name: 'Home & Kitchen', description: 'Appliances and kitchenware' },
      { name: 'Stationery', description: 'Books, pens, and paper' }
    ];

    const categoryMap = {};
    for (const cat of categoriesToCreate) {
      console.log(`Creating category: ${cat.name}`);
      try {
         const cRes = await axios.post(`${API_URL}/categories`, cat, authConfig);
         categoryMap[cat.name] = cRes.data.id;
      } catch (err) {
         if (err.response && err.response.data && err.response.data.message && err.response.data.message.includes('uk_category_name')) {
            console.log(`Category ${cat.name} already exists, fetching its id...`);
            const allCats = await axios.get(`${API_URL}/categories`, authConfig);
            const existingCat = allCats.data.find(c => c.name === cat.name);
            if (existingCat) { categoryMap[cat.name] = existingCat.id; }
         } else {
            console.error(`Error creating category ${cat.name}:`, err.response ? err.response.data : err.message);
         }
      }
    }

    // 3. Create Products
    const productsToCreate = [
      { name: 'Smartphone Pro Max', sku: 'ELEC-001', categoryId: categoryMap['Electronics'], price: 99999, costPrice: 85000, quantity: 50, reorderLevel: 10, unit: 'PCS' },
      { name: 'Wireless Headphones', sku: 'ELEC-002', categoryId: categoryMap['Electronics'], price: 4999, costPrice: 3000, quantity: 120, reorderLevel: 20, unit: 'PCS' },
      { name: '4K Smart TV 55"', sku: 'ELEC-003', categoryId: categoryMap['Electronics'], price: 54999, costPrice: 45000, quantity: 15, reorderLevel: 5, unit: 'PCS' },
      { name: 'Power Bank 20000mAh', sku: 'ELEC-004', categoryId: categoryMap['Electronics'], price: 1999, costPrice: 1200, quantity: 200, reorderLevel: 30, unit: 'PCS' },
      { name: 'Gaming Mouse', sku: 'ELEC-005', categoryId: categoryMap['Electronics'], price: 2999, costPrice: 1500, quantity: 80, reorderLevel: 15, unit: 'PCS' },
      
      { name: 'Organic Premium Rice 5kg', sku: 'GROC-001', categoryId: categoryMap['Groceries'], price: 450, costPrice: 350, quantity: 200, reorderLevel: 50, unit: 'BAG' },
      { name: 'Cold Pressed Olive Oil 1L', sku: 'GROC-002', categoryId: categoryMap['Groceries'], price: 899, costPrice: 700, quantity: 80, reorderLevel: 15, unit: 'BTL' },
      { name: 'Whole Wheat Bread', sku: 'GROC-003', categoryId: categoryMap['Groceries'], price: 50, costPrice: 30, quantity: 40, reorderLevel: 10, unit: 'PKT' },
      { name: 'Almonds 500g', sku: 'GROC-004', categoryId: categoryMap['Groceries'], price: 650, costPrice: 500, quantity: 60, reorderLevel: 20, unit: 'PKT' },
      { name: 'Green Tea 100 Bags', sku: 'GROC-005', categoryId: categoryMap['Groceries'], price: 250, costPrice: 150, quantity: 100, reorderLevel: 25, unit: 'BOX' },
      
      { name: 'Men\'s Cotton T-Shirt', sku: 'CLOTH-001', categoryId: categoryMap['Clothing'], price: 499, costPrice: 250, quantity: 150, reorderLevel: 30, unit: 'PCS' },
      { name: 'Women\'s Denim Jacket', sku: 'CLOTH-002', categoryId: categoryMap['Clothing'], price: 1999, costPrice: 1200, quantity: 60, reorderLevel: 10, unit: 'PCS' },
      { name: 'Sports Running Shoes', sku: 'CLOTH-003', categoryId: categoryMap['Clothing'], price: 2499, costPrice: 1500, quantity: 85, reorderLevel: 15, unit: 'PRS' },
      { name: 'Kids Winter Sweater', sku: 'CLOTH-004', categoryId: categoryMap['Clothing'], price: 899, costPrice: 500, quantity: 40, reorderLevel: 10, unit: 'PCS' },
      { name: 'Leather Belt', sku: 'CLOTH-005', categoryId: categoryMap['Clothing'], price: 599, costPrice: 300, quantity: 110, reorderLevel: 20, unit: 'PCS' },

      { name: 'Non-Stick Cookware Set', sku: 'HOME-001', categoryId: categoryMap['Home & Kitchen'], price: 3499, costPrice: 2000, quantity: 45, reorderLevel: 8, unit: 'SET' },
      { name: 'Vacuum Cleaner', sku: 'HOME-002', categoryId: categoryMap['Home & Kitchen'], price: 7999, costPrice: 6000, quantity: 20, reorderLevel: 4, unit: 'PCS' },
      { name: 'Ceramic Dinner Set', sku: 'HOME-003', categoryId: categoryMap['Home & Kitchen'], price: 2499, costPrice: 1500, quantity: 30, reorderLevel: 10, unit: 'SET' },
      { name: 'Microfiber Towel 4-Pack', sku: 'HOME-004', categoryId: categoryMap['Home & Kitchen'], price: 499, costPrice: 250, quantity: 80, reorderLevel: 15, unit: 'PKT' },

      { name: 'Premium Notebook Set of 5', sku: 'STAT-001', categoryId: categoryMap['Stationery'], price: 299, costPrice: 150, quantity: 300, reorderLevel: 50, unit: 'SET' },
      { name: 'Blue Gel Pens Box (50 pcs)', sku: 'STAT-002', categoryId: categoryMap['Stationery'], price: 400, costPrice: 200, quantity: 100, reorderLevel: 20, unit: 'BOX' },
      { name: 'Desk Organizer', sku: 'STAT-003', categoryId: categoryMap['Stationery'], price: 350, costPrice: 180, quantity: 60, reorderLevel: 15, unit: 'PCS' },
      { name: 'A4 Printer Paper (500 Sheets)', sku: 'STAT-004', categoryId: categoryMap['Stationery'], price: 220, costPrice: 140, quantity: 150, reorderLevel: 40, unit: 'REAM' }
    ];

    for (const prod of productsToCreate) {
      if (!prod.categoryId) {
         console.warn(`Missing category ID for product: ${prod.name}`);
         continue;
      }
      console.log(`Creating product: ${prod.name}`);
      try {
        await axios.post(`${API_URL}/products`, prod, authConfig);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message && err.response.data.message.includes('uk_products_sku')) {
           console.log(`Product ${prod.name} (SKU: ${prod.sku}) already exists. Skipping.`);
        } else {
           console.error(`Error creating product ${prod.name}:`, err.response ? err.response.data : err.message);
        }
      }
    }

    console.log('Seed data insertion completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.response ? error.response.data : error.message);
  }
}

seedData();
