import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// Configure runtime for longer execution
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

// Use DATABASE_URL first (with channel binding), then fallback to other URLs
const databaseUrl = process.env.DATABASE_URL || 
                   process.env.POSTGRES_URL_NON_POOLING || 
                   process.env.POSTGRES_URL!;

// Create connection with optimized settings for seeding
const createConnection = () => postgres(databaseUrl, { 
  ssl: databaseUrl.includes('localhost') ? false : 'require', // Disable SSL for localhost
  connect_timeout: 180, // 3 minutes
  idle_timeout: 180,    // 3 minutes
  max_lifetime: 60 * 30, // 30 minutes
  max: 1,
  transform: {
    undefined: null,
  },
});

// Helper function to wake up the database and establish connection
async function wakeUpDatabase(maxRetries = 3) {
  let sql: any;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa de conexão ${attempt}/${maxRetries}...`);
      
      sql = createConnection();
      
      // Try to wake up the database with a simple query
      await sql`SELECT 1 as test`;
      console.log(`✅ Conexão estabelecida na tentativa ${attempt}`);
      
      return sql;
    } catch (error) {
      lastError = error;
      console.log(`⚠️ Tentativa ${attempt} falhou:`, error instanceof Error ? error.message : 'Erro desconhecido');
      
      if (sql) {
        try {
          await sql.end();
        } catch (closeError) {
          // Ignore close errors
        }
      }
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 5000; // 5s, 10s, 15s
        console.log(`⏳ Aguardando ${waitTime/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

async function seedUsers(sql: any) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // Process users sequentially to avoid overwhelming the connection
  const insertedUsers = [];
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      ON CONFLICT (id) DO NOTHING;
    `;
    insertedUsers.push(result);
  }

  return insertedUsers;
}

async function seedInvoices(sql: any) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // Process invoices in batches to improve performance
  const batchSize = 10;
  const insertedInvoices = [];
  
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(
        (invoice) => sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `
      )
    );
    insertedInvoices.push(...batchResults);
  }

  return insertedInvoices;
}

async function seedCustomers(sql: any) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  // Process customers in batches to improve performance
  const batchSize = 10;
  const insertedCustomers = [];
  
  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(
        (customer) => sql`
          INSERT INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
          ON CONFLICT (id) DO NOTHING;
        `
      )
    );
    insertedCustomers.push(...batchResults);
  }

  return insertedCustomers;
}

async function seedRevenue(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  let sql: any;
  
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    console.log('📊 Configurações:', {
      url_type: process.env.POSTGRES_URL_NON_POOLING ? 'NON_POOLING' : 'POOLED',
      max_duration: '300s',
      runtime: 'nodejs'
    });
    
    // Wake up the database first (Neon databases can hibernate)
    console.log('� Acordando banco de dados (Neon pode estar hibernando)...');
    sql = await wakeUpDatabase();
    
    // Run seeding operations within a transaction
    console.log('🔒 Iniciando transação para seed...');
    const result = await sql.begin(async (sqlTx: any) => {
      console.log('👤 Seeding users...');
      await seedUsers(sqlTx);
      console.log('✅ Users seeded successfully');
      
      console.log('🏢 Seeding customers...');
      await seedCustomers(sqlTx);
      console.log('✅ Customers seeded successfully');
      
      console.log('📄 Seeding invoices...');
      await seedInvoices(sqlTx);
      console.log('✅ Invoices seeded successfully');
      
      console.log('💰 Seeding revenue...');
      await seedRevenue(sqlTx);
      console.log('✅ Revenue seeded successfully');
      
      return 'Database seeded successfully';
    });

    console.log('🎉 Seed concluído com sucesso!');
    return Response.json({ 
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString(),
      details: {
        users: users.length,
        customers: customers.length,
        invoices: invoices.length,
        revenue_records: revenue.length
      }
    });
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    
    // Provide more detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      name: error instanceof Error ? error.name : 'UnknownError',
      code: (error as any)?.code || 'UNKNOWN_CODE',
      timestamp: new Date().toISOString()
    };
    
    return Response.json({ 
      error: 'Failed to seed database',
      details: errorDetails,
      suggestions: [
        'Database might be hibernating (Neon free tier)',
        'Try again in a few moments',
        'Check your connection string',
        'Verify database is accessible'
      ]
    }, { status: 500 });
  } finally {
    if (sql) {
      try {
        await sql.end();
        console.log('🔌 Conexão com banco fechada');
      } catch (closeError) {
        console.error('⚠️ Erro ao fechar conexão:', closeError);
      }
    }
  }
}
