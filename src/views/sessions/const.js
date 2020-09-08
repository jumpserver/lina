import i18n from '@/i18n/i18n'

export const S3 = 's3'
export const CEPH = 'ceph'
export const SWIFT = 'swift'
export const OSS = 'oss'
export const AZURE = 'azure'

export const STORAGE_TYPE_META_MAP = {
  [S3]: {
    name: S3,
    title: 'S3',
    meta: ['bucket', 'access_key', 'secret_key', 'endpoint'],
    endpointHelpText: i18n.t('sessions.helpText.s3Endpoint')
  },
  [CEPH]: {
    name: CEPH,
    title: 'Ceph',
    meta: ['bucket', 'access_key', 'secret_key', 'endpoint']
  },
  [SWIFT]: {
    name: SWIFT,
    title: 'Swift',
    meta: ['bucket', 'access_key', 'secret_key', 'region', 'endpoint', 'protocol']
  },
  [OSS]: {
    name: OSS,
    title: 'Oss',
    meta: ['bucket', 'access_key', 'secret_key', 'endpoint'],
    endpointHelpText: i18n.t('sessions.helpText.ossEndpoint')
  },
  [AZURE]: {
    name: AZURE,
    title: 'Azure',
    meta: ['container_name', 'account_name', 'account_key', 'endpoint_suffix']
  }
}
