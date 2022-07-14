import { ORACLE } from '../const'

export function getDatabaseTypeFieldsMap(type) {
  switch (type) {
    case ORACLE:
      return ['host', 'port', 'database', 'version']
    default:
      return ['host', 'port', 'database']
  }
}
