<template>
  <span class="conform-td">
    <span v-if="!iValue" class="confirm-action">
      <el-tooltip v-if="row.present" :content="$tc('Add account to asset')" :open-delay="400">
        <el-button class="confirm action" size="mini" @click="handleConfirm">
          <i class="fa fa-plus" />
        </el-button>
      </el-tooltip>
      <el-tooltip v-else :content="$tc('Remove account ')" :open-delay="400">
        <el-button class="remove action" size="mini" @click="handleRemove">
          <i class="fa fa-minus" />
        </el-button>
      </el-tooltip>
      <el-tooltip :content="$tc('Ignore')" :open-delay="400">
        <el-button class="ignore action" size="mini" @click="handleIgnore">
          <svg-icon icon-class="ignore" />
        </el-button>
      </el-tooltip>
    </span>
    <el-tooltip v-else :content="iLabel" :open-delay="400" class="platform-status">
      <span v-if="iValue === 'confirmed' ">
        <i class="fa fa-check color-primary" />
      </span>
      <span v-else>
        <svg-icon icon-class="ignore" />
      </span>
    </el-tooltip>
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
        return {
          confirm: ({ row, cellValue }) => {
          },
          ignore: ({ row, cellValue }) => {
          },
          remove: ({ row, cellValue }) => {
          },
          confirmIcon: 'fa fa-check'
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
    },
    iConfirmIcon() {
      const icon = this.formatterArgs.confirmIcon
      if (typeof icon === 'function') {
        return icon({ row: this.row, cellValue: this.cellValue })
      } else {
        return icon
      }
    }
  },
  methods: {
    handleConfirm() {
      this.formatterArgs.confirm({ row: this.row, cellValue: this.cellValue })
    },
    handleIgnore() {
      this.formatterArgs.ignore({ row: this.row, cellValue: this.cellValue })
    },
    handleRemove() {
      this.formatterArgs.remove({ row: this.row, cellValue: this.cellValue })
    }
  }
}
</script>

<style lang='scss' scoped>

.action.el-button--mini {
  cursor: pointer;
  padding: 1px 4px;

  &.confirm {
    ::v-deep i {
      color: var(--color-primary);
    }
  }

  &.remove {
    ::v-deep i {
      color: var(--color-danger);
    }
  }

  &.ignore {
    ::v-deep svg.svg-icon {
    }
  }
}

.action.ignore {
  margin-left: 2px;
}

</style>
