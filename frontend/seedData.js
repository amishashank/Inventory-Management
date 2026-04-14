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
      { name: 'Stationery', description: 'Books, pens, and paper' },
      { name: 'Jewelry', description: 'Gold, silver, and precious stones' },
      { name: 'Automobile Parts', description: 'Spares and accessories for vehicles' },
      { name: 'Pharma & Health', description: 'Medicines and healthcare products' },
      { name: 'Furniture', description: 'Beds, sofas, and wooden goods' },
      { name: 'Toys & Games', description: 'Kids toys and board games' }
    ];

    const allCatsRes = await axios.get(`${API_URL}/categories`, authConfig);
    const existingCats = allCatsRes.data;
    
    const categoryMap = {};
    for (const cat of categoriesToCreate) {
      const existing = existingCats.find(c => c.name === cat.name);
      if (existing) {
         console.log(`Category ${cat.name} already exists. Using ID ${existing.id}`);
         categoryMap[cat.name] = existing.id;
      } else {
         console.log(`Creating category: ${cat.name}`);
         try {
           const cRes = await axios.post(`${API_URL}/categories`, cat, authConfig);
           categoryMap[cat.name] = cRes.data.id;
         } catch (err) {
           console.error(`Error creating category ${cat.name}:`, err.response ? err.response.data : err.message);
         }
      }
    }

    // 2.5 Create Outlets
    const outletsData = [
      { name: 'Main Branch', address: '100 Business Pkwy', phone: '100-200-3000' },
      { name: 'Downtown Outlet', address: '200 Metro St', phone: '100-200-3001' },
      { name: 'Airport Kiosk', address: 'Terminal A', phone: '100-200-3002' }
    ];
    const outletIds = [];
    console.log('Fetching/Creating Outlets...');
    const existingOutletsRes = await axios.get(`${API_URL}/outlets`, authConfig);
    const existingOutlets = existingOutletsRes.data;
    for (const out of outletsData) {
        const existing = existingOutlets.find(o => o.name === out.name);
        if (existing) {
            outletIds.push(existing.id);
        } else {
            console.log(`Creating Outlet: ${out.name}`);
            const outRes = await axios.post(`${API_URL}/outlets`, out, authConfig);
            outletIds.push(outRes.data.id);
        }
    }

    // 3. Create Products with varied GST Slabs
    const gstSlabs = [0, 0.25, 3, 5, 12, 18, 28];
    const adjectives = ['Premium', 'Pro', 'Classic', 'Modern', 'Eco', 'Super', 'Advanced', 'Basic', 'Ultra', 'Smart'];
    const nounsMap = {
      'Electronics': ['Drone', 'TV', 'Headphones', 'Speaker', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Watch', 'Camera'],
      'Groceries': ['Rice', 'Tea', 'Coffee', 'Spices', 'Honey', 'Almonds', 'Olive Oil', 'Bread', 'Cereal', 'Pasta'],
      'Clothing': ['Jacket', 'T-Shirt', 'Jeans', 'Sneakers', 'Sweater', 'Dress', 'Scarf', 'Hat', 'Belt', 'Socks'],
      'Home & Kitchen': ['Blender', 'Sofa', 'Mug', 'Pan', 'Vacuum', 'Toaster', 'Knife Set', 'Rug', 'Lamp', 'Towel'],
      'Stationery': ['Pen', 'Notebook', 'Folder', 'Stapler', 'Marker', 'Desk Organizer', 'Eraser', 'Pencil', 'Tape', 'Ruler'],
      'Jewelry': ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant', 'Chain', 'Brooch', 'Diamond', 'Gold Coin', 'Silver Bar'],
      'Automobile Parts': ['Tire', 'Battery', 'Wipers', 'Brake Pads', 'Oil Filter', 'Spark Plug', 'Headlight', 'Mirror', 'Seat Cover', 'Mat'],
      'Pharma & Health': ['Vitamins', 'Bandages', 'Ointment', 'Cough Syrup', 'Thermometer', 'Mask', 'Sanitizer', 'Painkiller', 'Inhaler', 'Drops'],
      'Furniture': ['Chair', 'Table', 'Bed', 'Bookshelf', 'Cabinet', 'Stool', 'Desk', 'Wardrobe', 'Hammock', 'Bench'],
      'Toys & Games': ['Puzzle', 'Action Figure', 'Doll', 'Board Game', 'Lego Set', 'Yo-Yo', 'Kite', 'Teddy Bear', 'Car', 'Train Set']
    };

    const productsToCreate = [];

    // Procedurally generate 50 products per category
    for (const cat of categoriesToCreate) {
      const catId = categoryMap[cat.name];
      const nouns = nounsMap[cat.name] || ['Item', 'Product', 'Widget'];
      const catPrefix = cat.name.substring(0, 4).toUpperCase();
      
      for (let i = 1; i <= 50; i++) {
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const price = Math.floor(Math.random() * (5000 - 50 + 1)) + 50; // Random price between 50 and 5000
        const costPrice = Math.floor(price * 0.7); // 30% margin
        const gstRate = gstSlabs[Math.floor(Math.random() * gstSlabs.length)];
        
        productsToCreate.push({
          name: `${adj} ${noun} V${i}`,
          sku: `${catPrefix}-${i}-${Math.floor(Math.random() * 1000)}`,
          categoryId: catId,
          price: price,
          costPrice: costPrice,
          unit: 'PCS',
          gstRate: gstRate
        });
      }
    }

    for (const prod of productsToCreate) {
      if (!prod.categoryId) {
         console.warn(`Missing category ID for product: ${prod.name}`);
         continue;
      }
      console.log(`Creating product: ${prod.name}`);
      try {
        const prodRes = await axios.post(`${API_URL}/products`, prod, authConfig);
        const newProductId = prodRes.data.id;
        
        // 4. Update Stock for Each Outlet
        for (const outId of outletIds) {
           const quantity = Math.floor(Math.random() * 200) + 10;
           const reorderLevel = Math.floor(quantity * 0.2);
           await axios.put(`${API_URL}/stocks/product/${newProductId}`, {
               outletId: outId,
               quantity: quantity,
               reorderLevel: reorderLevel
           }, authConfig);
        }
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
