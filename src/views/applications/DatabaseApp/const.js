import { MONGODB, REDIS } from '../const'

export function getDatabaseTypeFieldsMap(type) {
  const baseParams = ['host', 'port', 'database']
  const tlsParams = ['use_ssl', 'ca_cert']
  switch (type) {
    case REDIS:
      return baseParams.concat(tlsParams.concat(['client_cert', 'cert_key']))
    case MONGODB:
      return baseParams.concat(tlsParams.concat(['cert_key', 'allow_invalid_cert']))
    default:
      return baseParams
  }
}
