import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const swaggerPath = join(process.cwd(), '../../docs/api/swagger.yaml')
const outputPath = join(process.cwd(), 'src/types')

if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true })
}

try {
  console.log('Generating API types...')
  execSync(
    `npx swagger-typescript-api generate --path ${swaggerPath} --output ${outputPath} --name api.ts`,
    {
      stdio: 'inherit',
    }
  )
  console.log('API types generated successfully!')
} catch (error) {
  console.error('Error generating API types:', error)
  process.exit(1)
}
