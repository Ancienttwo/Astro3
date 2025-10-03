/*
 * Regenerate integrated ZiWei chart for a given input and write JSON to logs/
 */
import { generateIntegratedChart } from '../src/api/integrated-chart-api'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

async function main() {
  const input = {
    year: 1989,
    month: 1,
    day: 2,
    hour: 19,
    gender: 'female' as const,
    isLunar: false,
  }

  const res = await generateIntegratedChart(input)

  // repoRoot = packages/ziwei-core/../.. ; logs at repoRoot/logs
  const outDir = resolve(process.cwd(), '..', '..', 'logs')
  const outFile = resolve(outDir, 'ziwei-19890102-1930-female.integrated.json')
  mkdirSync(outDir, { recursive: true })

  // Pretty JSON for inspection
  writeFileSync(outFile, JSON.stringify(res, null, 2), 'utf8')
  // Also print a concise confirmation with key checks
  const lifePalace = (res.hookChart as any)['子']
  const tianjiAtZi = lifePalace?.["mainStars&sihuaStars"]?.find((s: any) => s.name === '天机')
  const minorAtYin = (res.hookChart as any)['寅']?.minorPeriod
  console.log(JSON.stringify({
    output: outFile,
    tianjiAtZiBrightness: tianjiAtZi?.brightness,
    minorAtYin,
  }, null, 2))
}

void main().catch((e) => {
  console.error(e)
  process.exit(1)
})
