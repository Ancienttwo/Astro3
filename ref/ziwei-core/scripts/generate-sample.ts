import { SolarTime } from 'tyme4ts'
import { createBaZiParams, generateCompleteZiWeiChart } from '../src/public-api'

const solarTime = SolarTime.fromYmdHms(1989, 1, 2, 19, 30, 0)
const params = createBaZiParams(solarTime, 1) // 1 = female
const chart = generateCompleteZiWeiChart(params)
console.log(JSON.stringify(chart, null, 2))

