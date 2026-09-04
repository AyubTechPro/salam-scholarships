#!/bin/bash

echo "🚀 Starting database setup..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set in .env file"
    exit 1
fi

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🔌 Testing database connection..."
if npx tsx scripts/test-db-connection.ts; then
    echo "✅ Connection successful!"
    
    echo "📊 Pushing schema to database..."
    npx prisma db push --accept-data-loss
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema pushed successfully!"
        
        echo "🌱 Seeding database..."
        npm run db:seed
        
        if [ $? -eq 0 ]; then
            echo "✅ Database seeded successfully!"
            echo ""
            echo "🎉 Database setup completed!"
            echo ""
            echo "📝 Next steps:"
            echo "1. Create your first admin user:"
            echo "   npm run studio"
            echo "   (Then navigate to User table and create an admin user)"
            echo ""
            echo "2. Or use the create-admin script:"
            echo "   npx tsx scripts/create-admin.ts"
        else
            echo "❌ Seeding failed"
            exit 1
        fi
    else
        echo "❌ Schema push failed"
        exit 1
    fi
else
    echo "❌ Database connection failed"
    echo ""
    echo "💡 Please check:"
    echo "1. Your Neon database is active"
    echo "2. Connection string in .env is correct"
    echo "3. Your IP is allowed in Neon settings"
    exit 1
fi

