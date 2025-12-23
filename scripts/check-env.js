// Script to check if environment variables are set
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {
  // dotenv not installed, try to load .env manually or use process.env
  console.log('⚠️  dotenv not found. Using process.env directly.\n');
}

const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('🔍 Checking environment variables...\n');

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName} - NOT SET`);
    allSet = false;
  } else {
    // Mask sensitive values
    const masked = varName.includes('PASSWORD') || varName.includes('KEY') || varName.includes('SECRET')
      ? value.substring(0, 10) + '...' + value.substring(value.length - 10)
      : value;
    console.log(`✅ ${varName} - ${masked}`);
  }
});

if (!allSet) {
  console.log('\n⚠️  Some environment variables are missing!');
  console.log('Please create a .env file in the root directory.');
  console.log('See SETUP.md for instructions.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
}

