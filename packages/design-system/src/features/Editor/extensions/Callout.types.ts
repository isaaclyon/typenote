export type CalloutType = 'info' | 'warning' | 'tip' | 'error';

export interface CalloutAttributes {
  calloutType: CalloutType;
}

export interface CalloutOptions {
  /** HTML attributes to add to the callout element */
  HTMLAttributes: Record<string, unknown>;
}
