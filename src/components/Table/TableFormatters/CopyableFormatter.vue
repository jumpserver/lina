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
      try {
        const text = await this.formatterArgs.getText({ cellValue: this.cellValue, row: this.row })
        copy(text)
      } catch (error) {
        if (!error?.isAxiosError) throw error
      }
    }
  }
}
</script>

<template>
  <span class="copyable">
    <span class="copyable__text">{{ iCellValue }}</span>
    <el-icon class="copy" @click="copy()"><CopyDocument /></el-icon>
  </span>
</template>

<style lang="scss" scoped>
.copyable {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.copyable__text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy {
  flex: 0 0 auto;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
}
</style>
