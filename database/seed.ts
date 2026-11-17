import 'dotenv/config';
import { SupabaseService } from '../src/services/supabaseService.ts';
import { isSupabaseConfigured, SUPABASE_URL } from '../src/lib/supabase.ts';

async function main() {
  console.log('--- SHIPINE Supabase Database Seeder ---');
  
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured!');
    console.error('Please create a .env file with valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.');
    console.error('Example:');
    console.error('  SUPABASE_URL="https://your-project.supabase.co"');
    console.error('  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    process.exit(1);
  }

  console.log(`📡 Connecting to Supabase at: ${SUPABASE_URL}`);
  
  console.log('🩺 Checking database health & tables...');
  const health = await SupabaseService.checkHealth();
  console.log(`Health status: ${health.message}`);

  console.log('🌱 Seeding initial categories, products, and coupons...');
  try {
    const result = await SupabaseService.seedInitialData();
    console.log('✅ Database seeded successfully!');
    console.log(`   - Categories: ${result.seeded.categories}`);
    console.log(`   - Products:   ${result.seeded.products}`);
    console.log(`   - Coupons:    ${result.seeded.coupons}`);
  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message || err);
    console.error('Note: Ensure you have executed database/migrations/01_init.sql in the Supabase SQL editor first.');
    process.exit(1);
  }
}

main();
