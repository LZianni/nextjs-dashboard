import postgres from 'postgres';

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!;

async function wakeUpDatabase() {
  console.log('🔌 Tentando acordar o banco de dados Neon...');
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    const sql = postgres(databaseUrl, { 
      ssl: 'require',
      connect_timeout: 120, // 2 minutos
      idle_timeout: 30,
      max_lifetime: 60 * 10,
      max: 1,
    });

    try {
      console.log(`Tentativa ${attempt}/5...`);
      await sql`SELECT NOW() as current_time`;
      console.log('✅ Banco de dados acordado com sucesso!');
      await sql.end();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log(`❌ Tentativa ${attempt} falhou:`, errorMessage);
      await sql.end();
      
      if (attempt < 5) {
        console.log('⏳ Aguardando 10 segundos antes da próxima tentativa...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  throw new Error('Não foi possível acordar o banco de dados após 5 tentativas');
}

export async function GET() {
  try {
    await wakeUpDatabase();
    
    // Redirect to seed after waking up
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/seed`);
    const result = await response.json();
    
    return Response.json({
      message: 'Database awakened and seeded successfully',
      seedResult: result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return Response.json({ 
      error: errorMessage,
      details: error 
    }, { status: 500 });
  }
}
