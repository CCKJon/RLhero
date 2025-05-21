// This script verifies that all required environment variables are set
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

console.log('Checking environment variables...')

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('Missing required environment variables:')
  missingVars.forEach(varName => console.error(`- ${varName}`))
  process.exit(1)
}

console.log('All required environment variables are set!')
console.log('\nCurrent values:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`${varName}: ${value ? '✓ Set' : '✗ Not set'}`)
}) 