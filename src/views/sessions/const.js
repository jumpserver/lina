export const S3 = 's3'
export const CEPH = 'ceph'
export const SWIFT = 'swift'
export const OSS = 'oss'
export const AZURE = 'azure'
export const OBS = 'obs'
export const COS = 'cos'

export const STORAGE_TYPE_META_MAP = {
  [S3]: {
    name: S3,
    title: 'S3',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT']
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
    title: 'OSS',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT']
  },
  [AZURE]: {
    name: AZURE,
    title: 'Azure',
    meta: ['CONTAINER_NAME', 'ACCOUNT_NAME', 'ACCOUNT_KEY', 'ENDPOINT_SUFFIX']
  },
  [OBS]: {
    name: OBS,
    title: 'OBS',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT']
  },
  [COS]: {
    name: COS,
    title: 'COS',
    meta: ['BUCKET', 'ACCESS_KEY', 'SECRET_KEY', 'ENDPOINT']
  }
}

export function getReplayStorageOptions() {
  const options = []
  const storages = Object.values(STORAGE_TYPE_META_MAP)
  for (const s of storages) {
    const option = {
      name: s.name,
      title: s.title
    }
    options.push(option)
  }
  return options
}
