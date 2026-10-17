export class RemoteError extends Error {
  constructor(readonly code: string, message: string, readonly nativeCode?: number) { super(message); this.name = 'RemoteError'; }
}

export function errorResult(error: unknown) {
  if (error instanceof RemoteError) return { code: error.code, message: error.message, ...(error.nativeCode === undefined ? {} : { nativeCode: error.nativeCode }) };
  return { code: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' };
}
