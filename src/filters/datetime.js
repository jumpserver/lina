import Vue from 'vue'
import { toSafeLocalDateStr } from '@/utils/common'

Vue.filter('date', function(value) {
  return toSafeLocalDateStr(value)
})

