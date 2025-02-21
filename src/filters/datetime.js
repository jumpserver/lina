import Vue from 'vue'
import { toSafeLocalDateStr } from '@/utils/time'

Vue.filter('date', function(value) {
  return toSafeLocalDateStr(value)
})

Vue.filter('async', async(asyncFn, args) => {
  if (typeof asyncFn === 'function') {
    return await asyncFn(args)
  } else if (typeof asyncFn === 'object' && asyncFn.then) {
    return await asyncFn
  } else {
    return asyncFn
  }
})
