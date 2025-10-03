import { SolarTime } from 'tyme4ts'
import { createBaZiParams, generateCompleteZiWeiChart } from '../dist/public-api.js'

async function main() {
  const solarTime = SolarTime.fromYmdHms(1989, 1, 2, 19, 30, 0)
  // gender: 0 = male, 1 = female
  const baziParams = createBaZiParams(solarTime, 1)
  const chart = generateCompleteZiWeiChart(baziParams)
  console.log(JSON.stringify(chart, null, 2))
}

void main().catch((err) => {
  console.error('Error generating chart:', err)
  process.exit(1)
})

