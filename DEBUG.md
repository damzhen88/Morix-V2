# MORIX CRM V2 - Debug Guide

## Quick Commands

```bash
# Development
npm run dev              # Frontend on :3000
cd backend && npm run start:dev  # Backend on :3001

# Testing
npm run test:run        # Run tests
npm run test:coverage   # With coverage

# Debug ports
# Frontend: chrome://inspect
# Backend: localhost:9229
```

## Common Issues

| Issue | Solution |
|-------|-----------|
| Port 3000 in use | `lsof -i :3000` then kill |
| Module not found | `npm install` |
| Type errors | `npx tsc --noEmit` |
| Cache issues | `rm -rf .next node_modules/.cache` |

## Testing Flow

1. Write test → 2. Run `npm run test:run` → 3. Fix → 4. Verify

## API Endpoints

- `GET /api/v1/products` - Products list
- `GET /api/v1/inventory` - Inventory
- `GET /api/v1/sales` - Sales orders
- `GET /api/v1/crm` - CRM deals
- `GET /api/v1/expenses` - Expenses
- `GET /api/v1/dashboard/kpis` - Dashboard stats
