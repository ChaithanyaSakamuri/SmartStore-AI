import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Sales from '../models/Sales.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sales.deleteMany({});

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@smartstore.ai',
      password: 'Admin@123',
      role: 'admin',
      company: 'SmartStore Inc',
    });
    await admin.save();
    console.log('✅ Admin user created');

    // Create sample products
    const products = [];
    const productData = [
      { 
        name: 'Laptop Pro', 
        category: 'Electronics', 
        price: 1299, 
        stock: 25, 
        discount: 10,
        description: 'Next-generation aluminum unibody workstation powered by a multi-core chip, high-density liquid display, and custom thermodynamic cooling systems.',
        image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&q=80'
      },
      { 
        name: 'Wireless Headphones', 
        category: 'Audio', 
        price: 199, 
        stock: 50, 
        discount: 15,
        description: 'Immersive soundscapes with active digital hybrid noise cancellation, studio-tuned acoustic drivers, and memory-foam cushions.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
      },
      { 
        name: 'USB-C Cable', 
        category: 'Accessories', 
        price: 25, 
        stock: 200, 
        discount: 0,
        description: 'High-speed braided cable engineered for high watt throughput and universal data sync protocols across modern mobile interfaces.',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80'
      },
      { 
        name: 'Mechanical Keyboard', 
        category: 'Peripherals', 
        price: 149, 
        stock: 35, 
        discount: 20,
        description: 'Acoustically dampened typing deck fitted with responsive tactile key-switches, customizable vibrant LED configurations, and dual-tone keycaps.',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'
      },
      { 
        name: 'External SSD', 
        category: 'Storage', 
        price: 89, 
        stock: 45, 
        discount: 5,
        description: 'Pulsing solid-state hardware encased in a shock-absorbing metal shell, supporting extreme read/write transfer rates on the go.',
        image: 'https://images.unsplash.com/photo-1597872200370-c53ece27e26c?w=600&q=80'
      },
      { 
        name: 'Monitor 4K', 
        category: 'Displays', 
        price: 399, 
        stock: 15, 
        discount: 12,
        description: 'High-fidelity workspace panel featuring extreme pixel density, accurate sRGB color spaces, and ultra-thin bezels.',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'
      },
      { 
        name: 'Mouse Pad', 
        category: 'Accessories', 
        price: 19, 
        stock: 100, 
        discount: 0,
        description: 'Micro-textured friction-less canvas optimized for high DPI tracking, featuring heat-treated stitched edges and anti-slip backing.',
        image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&q=80'
      },
      { 
        name: 'Webcam HD', 
        category: 'Camera', 
        price: 79, 
        stock: 30, 
        discount: 8,
        description: 'High-framerate video camera fitted with built-in dual stereo microphones and automatic ambient-light correction systems.',
        image: 'https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=600&q=80'
      },
    ];

    for (const data of productData) {
      const product = new Product({
        ...data,
        brand: 'SmartStore',
        rating: 4.5,
        reviewCount: 0,
        salesCount: 0,
        revenue: 0,
        tags: ['premium', 'quality', data.category.toLowerCase()],
      });
      await product.save();
      products.push(product);
    }
    console.log('✅ 8 sample products created');

    console.log('ℹ️ Dummy sales records skipped to ensure a completely fresh store state.');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: admin@smartstore.ai');
    console.log('   Password: Admin@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
