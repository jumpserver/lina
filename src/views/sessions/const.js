import i18n from '@/i18n/i18n'

export const S3 = 's3'
export const CEPH = 'ceph'
export const SWIFT = 'swift'
export const OSS = 'oss'
export const OBS = 'obs'
export const AZURE = 'azure'

export const STORAGE_TYPE_META_MAP = {
  [S3]: {
    name: S3,
    title: 'S3',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT'],
    endpointHelpText: i18n.t('sessions.helpText.s3Endpoint')
  },
  [CEPH]: {
    name: CEPH,
    title: 'Ceph',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT']
  },
  [SWIFT]: {
    name: SWIFT,
    title: 'Swift',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'REGION', 'ENDPOINT', 'PROTOCOL']
  },
  [OSS]: {
    name: OSS,
    title: 'Oss',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT'],
    endpointHelpText: i18n.t('sessions.helpText.ossEndpoint')
  },
  [OBS]: {
    name: OBS,
    title: 'Obs',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT'],
    endpointHelpText: i18n.t('sessions.helpText.obsEndpoint')
  },
  [AZURE]: {
    name: AZURE,
    title: 'Azure',
    meta: ['CONTAINER_NAME', 'ACCOUNT_NAME', 'ACCOUNT_KEY', 'ENDPOINT_SUFFIX']
  }
}
