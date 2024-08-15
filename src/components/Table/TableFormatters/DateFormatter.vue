<template>
  <span class="date">{{ dateValue }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
import { toSafeLocalDateStr } from '@/utils/time'

export default {
  name: 'DateFormatter',
  extends: BaseFormatter,
  data() {
    // let value
    // if (this.cellValue) {
    //   value = toSafeLocalDateStr(this.cellValue)
    // } else {
    //   value = '-'
    // }
    // const locale = this.$i18n.locale
    // const value = dt.toLocaleString(locale, { hourCycle: 'h23' })
    // debug(this.$i18n.locale)
    // return {
    //   value: value
    // }
    // return {
    //   value: `${year}-${month}-${date} ${hour}:${minutes}:${seconds}`
    // }
    return {}
  },
  computed: {
    dateValue() {
      if (this.cellValue) {
        return toSafeLocalDateStr(this.cellValue)
      } else {
        return '-'
      }
    }
  }
}
</script>
