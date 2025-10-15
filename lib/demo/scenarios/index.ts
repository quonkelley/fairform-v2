import { evictionScenario } from './eviction';
import { smallClaimsScenario } from './smallClaims';

/**
 * Current demo scenario
 * 
 * LOCKED FOR PUBLIC DEMO - DO NOT CHANGE
 * 
 * For internal testing, you can swap scenarios:
 * - export const currentScenario = evictionScenario;
 * - export const currentScenario = smallClaimsScenario;
 */
export const currentScenario = evictionScenario;

/**
 * All available demo scenarios
 * 
 * For testing different case types or scenarios
 */
export const scenarios = {
  eviction: evictionScenario,
  smallClaims: smallClaimsScenario,
} as const;

export type ScenarioType = keyof typeof scenarios;

/**
 * Get a specific scenario by name
 */
export function getScenario(name: ScenarioType) {
  return scenarios[name];
}

/**
 * Export individual scenarios for direct imports
 */
export { evictionScenario, smallClaimsScenario };

