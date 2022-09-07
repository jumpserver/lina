import { ORACLE, MONGODB, REDIS } from '../const'

export function getDatabaseTypeFieldsMap(type) {
  const baseParams = ['host', 'port', 'database']
  const tlsParams = ['use_ssl', 'allow_invalid_cert', 'ca_cert']
  switch (type) {
    case ORACLE:
      return baseParams.concat(['version'])
    case REDIS:
      return baseParams.concat(tlsParams.concat(['client_cert', 'cert_key']))
    case MONGODB:
      return baseParams.concat(tlsParams.concat(['cert_key']))
    default:
      return baseParams
  }
}
