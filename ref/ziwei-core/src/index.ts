/**
 * Slim legacy entry for @astroall/ziwei-core
 * Forwards all exports to the clean public API.
 */
export * from './public-api'
export { buildZiweiAgentQuery } from './agent/ziweiAgent'
export { buildZiweiWealthAgentPrompt } from './agent/ziweiWealthAgent'
