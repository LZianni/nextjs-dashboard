import postgres from 'postgres';

// Use DATABASE_URL first (local), then fallback to other URLs
const databaseUrl = process.env.DATABASE_URL || 
                   process.env.POSTGRES_URL_NON_POOLING || 
                   process.env.POSTGRES_URL!;

const sql = postgres(databaseUrl, { 
  ssl: databaseUrl.includes('localhost') ? false : 'require', // Disable SSL for localhost
  max: 1
});

async function listInvoices() {
	const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

	return data;
}

export async function GET() {
  try {
  	return Response.json(await listInvoices());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}
