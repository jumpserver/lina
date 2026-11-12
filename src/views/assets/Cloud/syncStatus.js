export const CLOUD_SYNC_ACTIONS = Object.freeze({
  create: { label: 'Create', type: 'success' },
  update: { label: 'Update', type: 'primary' },
  nochange: { label: 'NoChange', type: 'info' },
  stale: { label: 'PendingRelease', type: 'warning' },
  release: { label: 'Release', type: 'danger' },
  skip: { label: 'Skip', type: 'info' },
  conflict: { label: 'Conflict', type: 'danger' },
  fail: { label: 'Failed', type: 'danger' }
})

const EXCEPTION_LABELS = Object.freeze({
  region_timeout: 'CloudRegionScanTimeout',
  partial_region_failure: 'CloudProviderScanFailed',
  execution_partial: 'CloudSyncPartialFailure',
  execution_timeout: 'CloudSyncTimeout',
  execution_failed: 'CloudSyncFailed',
  binding_conflict: 'CloudBindingConflict'
})

// Provider SDK messages remain available in the tooltip for troubleshooting.
// Match specific error codes rather than an HTTP status (404 can mean many things).
const PROVIDER_ERRORS = [
  [
    /InvalidAccessKeyId(?:\.NotFound)?|InvalidClientTokenId|InvalidAuthenticationToken|AuthFailure\.(?:SecretIdNotFound|SignatureFailure)|SignatureDoesNotMatch/i,
    'CloudSyncInvalidCredentials'
  ],
  [
    /Forbidden|AccessDenied|UnauthorizedOperation|AuthorizationFailed/i,
    'CloudSyncPermissionDenied'
  ],
  [/Throttling|RequestLimitExceeded|TooManyRequests|RateLimitExceeded/i, 'CloudSyncRateLimited']
]

export function formatCloudSyncException(exception, translate) {
  if (!exception) return { message: '-', detail: '' }
  const raw = String(exception.message || '').trim()
  const providerError = PROVIDER_ERRORS.find(([pattern]) => pattern.test(raw))
  const key = providerError?.[1] || EXCEPTION_LABELS[exception.code]
  const message = key ? translate(key) : raw || '-'
  return {
    message,
    detail: raw && raw !== message ? `${message}\n\n${raw}` : message === '-' ? '' : message
  }
}
