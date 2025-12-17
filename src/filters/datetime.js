import { toSafeLocalDateStr } from '@/utils/common/time'

export function getDatetimeFilters() {
  return {
    date(value) {
      return toSafeLocalDateStr(value)
    },
    async: async (asyncFn, args) => {
      if (typeof asyncFn === 'function') {
        return await asyncFn(args)
      } else if (typeof asyncFn === 'object' && asyncFn.then) {
        return await asyncFn
      } else {
        return asyncFn
      }
    }
  }
}

export default getDatetimeFilters
