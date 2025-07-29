import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  
  // Simple ping endpoint
  return Response.json({ 
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || '3001'
  });
}
