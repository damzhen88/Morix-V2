# MORIX CRM Backend - Summary

## What Was Fixed/Created

### Fixed Issues:
1. **Inventory Service** - Fixed syntax error where methods were defined outside the class (missing closing brace)
2. **Products Module** - Created missing `product-image.entity.ts` and fixed entities index
3. **Purchase Module** - Created `purchase-order.entity.ts` and `purchase-item.entity.ts` entities
4. **Sales Module** - Fixed entity imports and removed OrderImage reference from SalesOrder
5. **Expenses Module** - Created proper `expense.entity.ts` with full schema
6. **Customers Module** - Created proper `customer.entity.ts` with full schema
7. **Dashboard Module** - Created proper entity
8. **Product DTO** - Fixed decorator syntax error (`@IsOptional() (['active', 'inactive'])` pattern)
9. **Database Module** - Updated to use Supabase PostgreSQL connection
10. **Auth Module** - All files verified (controller, service, JWT strategy, guards)
11. **App Module** - Fixed import path for DatabaseModule
12. **CRM Entities Index** - Fixed export path

### Created Files:
- `.env` file with configuration
- All missing entity files across modules

## API Endpoints Available

### Auth (public)
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user (requires JWT)

### Products (protected)
- `GET /products` - List all products (with search, category, status filters)
- `GET /products/:id` - Get single product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Inventory (protected)
- `GET /inventory` - List all inventory
- `GET /inventory/total-value` - Get total inventory value
- `GET /inventory/product/:productId` - Get inventory for specific product
- `GET /inventory/product/:productId/movements` - Get stock movements
- `POST /inventory/stock-in` - Add stock
- `POST /inventory/stock-out` - Remove stock
- `PUT /inventory/adjust/:productId` - Adjust stock quantity

### Purchase (protected)
- `POST /purchase` - Create purchase order (TODO: implement)
- `GET /purchase` - List purchase orders (TODO: implement)

### Sales (protected)
- `GET /sales` - List orders (with status, payment filters)
- `GET /sales/stats` - Get sales statistics
- `GET /sales/:id` - Get single order
- `POST /sales` - Create order
- `PUT /sales/:id` - Update order
- `PUT /sales/:id/status` - Update order status
- `PUT /sales/:id/payment` - Update payment status
- `DELETE /sales/:id` - Delete order

### CRM (protected)
- `GET /crm` - List deals (with stage filter)
- `GET /crm/pipeline` - Get pipeline statistics
- `GET /crm/:id` - Get single deal
- `POST /crm` - Create deal
- `PUT /crm/:id` - Update deal
- `PUT /crm/:id/stage` - Update deal stage
- `DELETE /crm/:id` - Delete deal

### Expenses (protected)
- `GET /expenses` - List expenses (with category, status filters)
- `GET /expenses/total-by-category` - Get totals by category
- `GET /expenses/total` - Get total expenses
- `GET /expenses/:id` - Get single expense
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Customers (public)
- `GET /customers` - List customers
- `GET /customers/:id` - Get single customer
- `POST /customers` - Create customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Dashboard (protected)
- `GET /dashboard/kpis` - Get KPIs
- `GET /dashboard/trends` - Get monthly trends
- `GET /dashboard/cost-breakdown` - Get cost breakdown

## Environment Variables Needed

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://ltciqzjcnlrkgbcdnegt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=morix-jwt-secret-key-2024-secure
DB_HOST=db.ltciqzjcnlrkgbcdnegt.supabase.co
DB_PORT=5432
DB_USER=postgres.ltciqzjcnlrkgbcdnegt
DB_PASSWORD=your_supabase_db_password_here
DB_NAME=postgres
FRONTEND_URL=http://localhost:3000
```

## How to Run Locally

1. **Install dependencies:**
   ```bash
   cd /Users/kritsadak/.openclaw/workspace/morix-crm-v2/backend
   npm install
   ```

2. **Update `.env` file:**
   - Get `SUPABASE_SERVICE_ROLE_KEY` from: https://ltciqzjcnlrkgbcdnegt.supabase.co/project/default/settings/api
   - Set `DB_PASSWORD` (can use Supabase anon key as password for direct PostgreSQL connection)

3. **Run development server:**
   ```bash
   npm run start:dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## How to Deploy to Vercel

1. **Create `vercel.json` at project root:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "nestjs",
     "installCommand": "npm install"
   }
   ```

2. **Deploy via Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **Or connect GitHub repository** in Vercel dashboard and set:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add all from `.env` file

## Notes

- All protected endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Database uses TypeORM with PostgreSQL via Supabase
- The backend is standalone and can be deployed independently from the frontend