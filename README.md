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

## 🏗️ System Architecture

The following diagram illustrates the high-fidelity, dual-role full-stack system architecture of SmartStore AI:

```mermaid
graph TD
    %% User Roles & Client App
    subgraph Client [React Frontend / client]
        Customer[🛒 Customer Session]
        Admin[👤 Admin Dashboard]
        Cart[🛍️ Shopping Cart / CartContext]
        Chatbot[🧠 Gemini AI Chatbot / AIChatBot]
    end

    %% Web Services & Endpoints
    subgraph Express [Express Server / server]
        AuthRouter[/api/auth]
        ProductRouter[/api/products]
        DashboardRouter[/api/dashboard]
        AIRouter[/api/ai]
        AuthMiddleware[🔐 Auth Middleware]
    end

    %% Storage & AI Engines
    subgraph Data [Data & AI Engine]
        MongoDB[(🍃 Local MongoDB Failover)]
        Atlas[(☁️ MongoDB Atlas Master)]
        GeminiAPI[✨ Google Gemini AI API]
    end

    %% Connections - Customer Roles
    Customer -->|Manages Cart| Cart
    Cart -->|Quick Buy / Checkout| ProductRouter
    Customer -->|Interacts| Chatbot
    
    %% Connections - Admin Roles
    Admin -->|Fulfillment Status Update| DashboardRouter

    %% Routers to Auth Middleware & Engines
    AuthRouter --> AuthMiddleware
    ProductRouter --> AuthMiddleware
    DashboardRouter --> AuthMiddleware
    AIRouter --> AuthMiddleware
    
    %% Storage Connectors
    AuthMiddleware -->|Persists & Validates| MongoDB
    AuthMiddleware -->|Primary Target| Atlas
    AIRouter -->|Live Catalog Context & Prompts| GeminiAPI
```

---

## 📊 Database Models & Schema Table

SmartStore AI runs on a fully relational-modeled Document Schema design utilizing Mongoose ODM.

### 1. User Model (`User.js`)
Stores user profiles, roles, authentication credentials, and lock security records.

| Field | Type | Validation / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required | Full user name. |
| `email` | `String` | Unique, lowercase, trimmed | Case-insensitive user email. |
| `password` | `String` | Required, Bcrypt-hashed | Hashed user password. |
| `role` | `String` | Enum: `['admin', 'user']`, Default: `'user'` | Dynamic authorization role. |
| `avatar` | `String` | Default: `null` | URL path to profile avatar. |
| `phone` | `String` | Optional | User phone contact. |
| `company` | `String` | Optional | User organization name. |
| `preferences` | `Object` | Theme (default `'dark'`), Notifications (default `true`) | User custom settings. |
| `lastLogin` | `Date` | Timestamp | Recorded last sign-in. |
| `loginAttempts`| `Number` | Default: `0` | Consecutive failed logins. |
| `lockUntil` | `Date` | Timestamp | Lockout end time after failures. |

### 2. Product Model (`Product.js`)
Stores retail catalog items, inventory levels, dynamic tagging, and AI-predicted pricing metrics.

| Field | Type | Validation / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required, Indexed | Product title. |
| `description` | `String` | Indexed | Detailed product description. |
| `price` | `Number` | Required | Live retail unit price. |
| `originalPrice`| `Number` | Optional | Original price before markdowns. |
| `discount` | `Number` | Default: `0` | Active promo markdown (%). |
| `category` | `String` | Optional | Product category grouping. |
| `brand` | `String` | Optional | Manufacturing brand. |
| `image` | `String` | Optional | Primary Unsplash thumbnail link. |
| `images` | `[String]` | Array of links | Multi-angle product imagery gallery. |
| `stock` | `Number` | Default: `0` | Live inventory stock remaining. |
| `sku` | `String` | Optional | Unique SKU bar code. |
| `rating` | `Number` | Default: `0` | Aggregate user ratings stars. |
| `reviewCount` | `Number` | Default: `0` | Cumulative total reviews count. |
| `salesCount` | `Number` | Default: `0` | Total units ordered in system. |
| `revenue` | `Number` | Default: `0` | Cumulative total revenue generated. |
| `aiGenerated` | `Object` | Suggested price, tags, captions | Gemini-suggested pricing & marketing copy. |

### 3. Sales Model (`Sales.js`)
Tracks financial transactions, order groupings, payment processing, and shipment statuses.

| Field | Type | Validation / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `orderId` | `String` | Required, Indexed | Consolidated transaction ID. |
| `product` | `ObjectId` | Ref: `'Product'` | Referenced product model. |
| `productName` | `String` | Optional | Snapshot of item title at sale. |
| `quantity` | `Number` | Required | Total units ordered. |
| `unitPrice` | `Number` | Required | Snapshot price at transaction time. |
| `totalAmount` | `Number` | Computed value | Snapshot cost pre-discount (`qty * price`). |
| `discount` | `Number` | Default: `0` | Markdown snapshot at purchase (%). |
| `finalAmount` | `Number` | Computed value | Final customer charge after discounts. |
| `status` | `String` | Enum: `['pending', 'completed', 'cancelled']`, Default: `'pending'` | Active shipment status. |
| `paymentMethod`| `String` | Credit Card, PayPal, or SmartPay | Dynamic checkout payment choice. |
| `customerEmail`| `String` | Trimmed, lowercase | Customer email reference. |
| `customerPhone`| `String` | Required | Contact shipping phone. |
| `shippingAddress`| `String` | Required | Customer delivery destination. |
| `notes` | `String` | Optional | Customer delivery instructions. |

### 4. AIInsight Model (`AIInsight.js`)
Caches predictive business analytics insights generated by Gemini AI.

| Field | Type | Validation / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `type` | `String` | Required | Insight category (financial, stock, etc.). |
| `title` | `String` | Required | Dynamic insight header. |
| `description`| `String` | Required | Detailed predictive insight text. |
| `metrics` | `Object` | Optional | Linked data numbers. |
| `recommendations`| `[String]`| Dynamic array | List of AI-recommended actions. |

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
