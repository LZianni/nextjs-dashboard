import postgres from 'postgres';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  let sql: any;
  
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Test all available connection URLs
    const databaseUrl = process.env.DATABASE_URL;
    const pooledUrl = process.env.POSTGRES_URL;
    const nonPooledUrl = process.env.POSTGRES_URL_NON_POOLING;
    
    console.log('URLs disponíveis:', {
      hasDatabase: !!databaseUrl,
      hasPooled: !!pooledUrl,
      hasNonPooled: !!nonPooledUrl,
      usingUrl: databaseUrl ? 'DATABASE_URL' : (nonPooledUrl ? 'NON_POOLING' : 'POOLED')
    });
    
    const finalUrl = databaseUrl || nonPooledUrl || pooledUrl;
    
    if (!finalUrl) {
      throw new Error('Nenhuma URL de banco de dados encontrada nas variáveis de ambiente');
    }
    
    // Create connection with minimal settings for testing
    sql = postgres(finalUrl, { 
      ssl: finalUrl.includes('localhost') ? false : 'require', // Disable SSL for localhost
      connect_timeout: 30,
      max: 1,
    });
    
    // Test basic connectivity
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Conexão bem-sucedida:', result[0]);
    
    // Test if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    return Response.json({
      success: true,
      message: 'Conexão com banco estabelecida com sucesso',
      database_time: result[0]?.current_time,
      existing_tables: tables.map((t: any) => t.table_name),
      connection_info: {
        using_non_pooled: !!nonPooledUrl,
        total_tables: tables.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: {
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
    
  } finally {
    if (sql) {
      try {
        await sql.end();
        console.log('🔌 Conexão fechada');
      } catch (closeError) {
        console.error('⚠️ Erro ao fechar conexão:', closeError);
      }
    }
  }
}
