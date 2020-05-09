<template>
  <div>
    {{ this.date(this.cellValue) }}
  </div>
</template>

<script>
import BaseFormatter from './base'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'DateFormatter',
  components: {},
  extends: BaseFormatter,
  data() {
    return {}
  },
  methods: {
    date(val) {
      return toSafeLocalDateStr(val)
    }
  }
}
</script>

<style lang='less' scoped>

</style>
