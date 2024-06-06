import Vue from 'vue'
import { toSafeLocalDateStr } from '@/utils/time'

Vue.filter('date', function(value) {
  return toSafeLocalDateStr(value)
})

