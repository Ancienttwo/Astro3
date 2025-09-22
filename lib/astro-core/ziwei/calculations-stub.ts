// This file used to contain stub implementations. All stubs have been removed.
// Re-export types mapped to the real implementations to avoid accidental stub usage.

export type { ZiWeiChartInput as ChartInput, ZiWeiCompleteChart as ChartOutput } from './complete-chart-types'

// If any of the old stubbed functions are accidentally imported, throw explicit errors to prevent silent fallback.
function removed(name: string): never { throw new Error(`Removed stub ${name}: use real calculation modules from './calculations' and './chart-generator'.`) }

// Deprecated APIs - hard errors
export const calculateYearGanZhi = () => removed('calculateYearGanZhi')
export const calculateLifePalace = () => removed('calculateLifePalace')
export const calculateBodyPalace = () => removed('calculateBodyPalace')
export const calculateFiveElementsBureauDetail = () => removed('calculateFiveElementsBureauDetail')
export const calculateZiweiPosition = () => removed('calculateZiweiPosition')
export const calculateTianfuPosition = () => removed('calculateTianfuPosition')
export const calculateDouJunPosition = () => removed('calculateDouJunPosition')
export const calculateFleetingYears = () => removed('calculateFleetingYears')
export const calculateLaiyinPalace = () => removed('calculateLaiyinPalace')
export const calculateMinorPeriod = () => removed('calculateMinorPeriod')
export const getStarBrightness = () => removed('getStarBrightness')
export const calculateSelfTransformations = () => removed('calculateSelfTransformations')
export const generateCompleteZiWeiChart = () => removed('generateCompleteZiWeiChart')
export const calculateMainStarPositions = () => removed('calculateMainStarPositions')
export const calculateAuxiliaryStarPositions = () => removed('calculateAuxiliaryStarPositions')
export const calculateMinorStarPositions = () => removed('calculateMinorStarPositions')
export const calculateBirthYearSihua = () => removed('calculateBirthYearSihua')
export const calculateMasters = () => removed('calculateMasters')
export const calculateDouJun = () => removed('calculateDouJun')
export const calculateMajorPeriodStartAge = () => removed('calculateMajorPeriodStartAge')
export const calculateMajorPeriods = () => removed('calculateMajorPeriods')
export const BRIGHTNESS_LEVEL_MAP = removed('BRIGHTNESS_LEVEL_MAP')

export type StarBrightnessValue = keyof typeof BRIGHTNESS_LEVEL_MAP
