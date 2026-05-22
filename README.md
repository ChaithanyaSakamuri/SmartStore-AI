# SmartStore AI - E-commerce Dashboard with AI Integration

A full-stack web application featuring a React frontend with Tailwind CSS and a Node.js/Express backend with MongoDB integration. Includes AI-powered insights, real-time analytics, and comprehensive product management.

## 🚀 Features

### Frontend
- ✅ Modern React with Vite
- ✅ Responsive design with Tailwind CSS
- ✅ Beautiful UI with Framer Motion animations
- ✅ Real-time charts and analytics (Recharts)
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Product CRUD operations
- ✅ Dashboard analytics
- ✅ AI insights page
- ✅ Settings management

### Backend
- ✅ Express.js REST API
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ Database seeding with sample data
- ✅ Error handling middleware
- ✅ CORS support
- ✅ Input validation
- ✅ AI integration (OpenAI/Gemini ready)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB account (Atlas or local)
- Git

## 🛠️ Installation

### 1. Clone the repository
```bash
cd smartstore-ai
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
```

### 3. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env.local
```

## 🔑 Environment Variables

### Backend (`server/.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartstore
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your-key
GEMINI_API_KEY=your-gemini-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env.local`)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SmartStore AI
```

## ▶️ Running the Application

### Terminal 1 - Start Backend
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 2 - Start Frontend
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### Terminal 3 - Seed Database (Optional)
```bash
cd server
npm run seed
```

## 📝 Login Credentials

After seeding:
- **Email:** admin@smartstore.ai
- **Password:** Admin@123

## 📁 Project Structure

```
smartstore-ai/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service
│   │   ├── App.jsx           # Main app
│   │   └── main.jsx          # Entry point
│   └── package.json
│
└── server/                    # Node.js Backend
    ├── config/               # Database config
    ├── middleware/           # Auth & error handling
    ├── models/              # MongoDB schemas
    ├── routes/              # API routes
    ├── services/            # Business logic
    ├── seed/                # Database seeding
    ├── server.js            # Entry point
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh JWT
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/alerts/low-stock` - Get low stock items

### Dashboard
- `GET /api/dashboard/analytics` - Get analytics
- `GET /api/dashboard/top-products` - Get top products
- `GET /api/dashboard/revenue` - Get revenue data

### AI Features
- `POST /api/ai/generate-content` - Generate AI content
- `GET /api/ai/insights` - Get AI insights
- `POST /api/ai/analyze-trends` - Analyze trends
- `POST /api/ai/inventory-optimization` - Inventory suggestions
- `POST /api/ai/chat` - AI chatbot

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartstore.ai","password":"Admin@123"}'

# Get products
curl http://localhost:5000/api/products?page=1&limit=10
```

## 🏗️ Build for Production

### Frontend
```bash
cd client
npm run build
# Output in dist/ folder
```

### Backend
```bash
cd server
# Just ensure .env is configured
npm start
```

## 📊 Database Models

### User
- name, email, password, role, company
- lastLogin, loginAttempts, timestamps

### Product
- name, description, price, stock
- category, brand, rating, salesCount
- aiGenerated fields, timestamps

### Sales
- orderId, product, quantity, totalAmount
- status, paymentMethod, customer info
- timestamps

### AIInsight
- type, title, description
- metrics, recommendations
- timestamps

## 🔐 Security Features

- JWT authentication
- Password hashing (bcryptjs)
- Protected routes
- Input validation
- CORS configuration
- Error handling
- XSS prevention ready

## 📚 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Router

### Backend
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcryptjs
- Node.js

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd client
npm run build
vercel deploy
```

### Heroku/Railway (Backend)
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

## 📄 License

MIT

## 👤 Author

SmartStore AI Team

---

**Happy coding! 🎉**
