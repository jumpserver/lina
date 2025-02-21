<script>
import BaseFormatter from './base.vue'
import { copy } from '@/utils/common'
export default {
  name: 'CopyableFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          shadow: false,
          getText: ({ cellValue }) => cellValue
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    iCellValue() {
      if (this.formatterArgs.shadow) {
        return '*'.repeat(6)
      } else {
        return this.cellValue
      }
    }
  },
  methods: {
    async copy() {
      const text = await this.formatterArgs.getText({ cellValue: this.cellValue, row: this.row })
      copy(text)
    }
  }
}
</script>

<template>
  <span class="copyable">
    {{ iCellValue }} <i class="el-icon-copy-document copy" @click="copy()" />
  </span>
</template>

<style lang="scss" scoped>
.copy {
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
}

</style>
