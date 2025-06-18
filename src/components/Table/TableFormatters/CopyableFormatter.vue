<script>
import BaseFormatter from './base.vue'
import { copy } from '@/utils/common/index'

export default {
  name: 'CopyableFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          shadow: false,
          getText: ({ cellValue }) => cellValue,
          iconPosition: 'right'
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
    },
    iconPosition() {
      return this.formatterArgs.iconPosition
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
    <span :style="{ order: 2 }">{{ iCellValue }}</span>
    <i :style="{ order: iconPosition === 'left' ? 0 : 3 } " class="el-icon-copy-document copy" @click="copy()" />
  </span>
</template>

<style lang="scss" scoped>
.copyable {
  display: flex;
  align-items: center;
  gap: 4px; /* 元素间距 */
}

.copy {
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
}

</style>
