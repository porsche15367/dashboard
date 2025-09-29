# Marketplace Admin Dashboard

A comprehensive Next.js admin dashboard for managing the marketplace platform.

## Features

- **Authentication**: Secure admin login with JWT
- **Vendor Management**: Approve, reject, and manage vendors
- **User Management**: View, suspend, and block users
- **Product Management**: Monitor and manage products across vendors
- **Order Management**: Track and update order status
- **Coupon Management**: Create and manage discount coupons
- **Category Management**: Manage vendor and product categories
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Real-time Updates**: Live data updates with React Query

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for forms
- **Recharts** for data visualization
- **Axios** for API calls

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Default Admin Credentials

- **Email**: admin@marketplace.com
- **Password**: AdminPassword123!

## API Integration

The dashboard integrates with the marketplace backend API. Make sure the backend is running on `http://localhost:3000` (or update the `NEXT_PUBLIC_API_URL` environment variable).

## Available Pages

- **Dashboard**: Overview with key metrics and charts
- **Analytics**: Detailed analytics and reporting
- **Users**: User management and account status
- **Vendors**: Vendor approval and management
- **Products**: Product monitoring and management
- **Orders**: Order tracking and status updates
- **Coupons**: Discount coupon management
- **Categories**: Vendor and product category management

## Features Overview

### Dashboard

- Key performance metrics
- Revenue and sales charts
- Recent orders overview
- Top vendors and products

### User Management

- View all users with pagination
- Suspend/unsuspend users
- Block/unblock users
- Search and filter functionality

### Vendor Management

- Approve/reject vendor applications
- View vendor details and performance
- Manage vendor status
- Vendor analytics

### Product Management

- View all products across vendors
- Search and filter products
- Toggle product status
- Product performance metrics

### Order Management

- Track order status
- Update order status
- Cancel orders
- Order analytics

### Analytics

- Revenue and sales trends
- Vendor performance metrics
- Product popularity
- Category-wise analytics
- Interactive charts and graphs

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── lib/                 # Utilities and configurations
│   ├── api.ts          # API client
│   ├── auth.ts         # Authentication store
│   └── api-services.ts # API service functions
└── types/              # TypeScript type definitions
```

### Adding New Features

1. Create new pages in `src/app/dashboard/`
2. Add API services in `src/lib/api-services.ts`
3. Update types in `src/types/index.ts`
4. Add navigation items in `src/components/layout/sidebar.tsx`

## Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
