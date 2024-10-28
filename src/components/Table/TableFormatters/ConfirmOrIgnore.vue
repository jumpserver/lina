<template>
  <span class="conform-td">
    <span v-if="!iValue" class="confirm-action">
      <el-tooltip :content="$tc('Confirm')" :open-delay="400">
        <el-button class="confirm action" icon="el-icon-check" size="mini" type="primary" />
      </el-tooltip>
      <el-tooltip :content="$tc('Ignore')" :open-delay="400">
        <el-button class="ignore action" icon="el-icon-close-notification" size="mini" />
      </el-tooltip>
    </span>
    <span v-else class="platform-status">{{ iLabel }}</span>
  </span>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'ConfirmOrIgnoreFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    iValue() {
      if (this.cellValueIsLabelChoice()) {
        return this.cellValue.value
      } else {
        return this.cellValue
      }
    },
    iLabel() {
      if (this.cellValueIsLabelChoice()) {
        return this.cellValue.label
      } else {
        return this.cellValue
      }
    }
  }
}
</script>

<style scoped>

.action.el-button--mini {
  cursor: pointer;
  padding: 1px 4px;

  &.confirm {
  }
}

.action.ignore {
  margin-left: 2px;
}

</style>
