import { ORACLE, MONGODB } from '../const'

export function getDatabaseTypeFieldsMap(type) {
  const baseParams = ['host', 'port', 'database']
  switch (type) {
    case ORACLE:
      return baseParams.concat(['version'])
    case MONGODB:
      return baseParams.concat(['use_ssl', 'ca_cert'])
    default:
      return baseParams
  }
}
