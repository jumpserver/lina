<template>
  <el-tooltip v-if="overflowed" :content="display" :show-after="200" effect="dark" placement="top">
    <span>{{ shown }}</span>
  </el-tooltip>
  <span v-else>{{ shown }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
import { getTextDisplayWidth } from '@/components/Table/AutoDataTable/utils'

export default {
  name: 'OverflowTooltipFormatter',
  extends: BaseFormatter,
  computed: {
    display() {
      const getText = this.col.formatterArgs?.getText
      if (typeof getText === 'function') {
        return String(getText({ row: this.row, cellValue: this.cellValue }) || '-')
      }
      return String(this.cellValue ?? '-')
    },
    maxWidth() {
      const configured = Number.parseFloat(this.col.formatterArgs?.maxWidth || this.col.width)
      return Number.isFinite(configured) ? Math.max(configured - 32, 80) : 160
    },
    shown() {
      return this.truncate(this.display, this.maxWidth).text
    },
    overflowed() {
      return this.truncate(this.display, this.maxWidth).overflowed
    }
  },
  methods: {
    truncate(text, maxWidth) {
      if (getTextDisplayWidth(text) <= maxWidth) {
        return { text, overflowed: false }
      }
      const ellipsis = '...'
      const limit = maxWidth - getTextDisplayWidth(ellipsis)
      let end = text.length
      while (end > 0 && getTextDisplayWidth(text.slice(0, end)) > limit) {
        end -= 1
      }
      return { text: `${text.slice(0, end)}${ellipsis}`, overflowed: true }
    }
  }
}
</script>
