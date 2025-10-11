export type FeatureFlags = {
  dayInCourt: boolean;
  glossaryAdmin: boolean;
  documentReadiness: boolean;
};

const defaultFlags: FeatureFlags = {
  dayInCourt: true,
  glossaryAdmin: false,
  documentReadiness: false,
};

export const flags: FeatureFlags = {
  ...defaultFlags,
};

export function isFeatureEnabled<K extends keyof FeatureFlags>(flag: K): boolean {
  return Boolean(flags[flag]);
}
