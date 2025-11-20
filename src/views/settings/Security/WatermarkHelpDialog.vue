<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="iVisible"
    class="help-dialog"
    top="1vh"
    width="50%"
  >
    <p>{{ variablesHelpText }}</p>
    <table border="1" class="help-table">
      <tr>
        <th>{{ $tc('Variable') }}</th>
        <th>{{ $tc('Description') }}</th>
        <th>{{ $tc('Example') }}</th>
      </tr>
      <tr v-for="(item, index) in variables" :key="index">
        <td :title="$tc('ClickCopy')" class="item-td text-link" @click="onCopy(item.key)">
          <label class="item-label">{{ item.key }}</label>
        </td>
        <td><span>{{ item.label }}</span></td>
        <td><span>{{ item.example }}</span></td>
      </tr>
    </table>
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'
import { copy } from '@/utils/common/index'

export default {
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    variables: {
      type: Array,
      default: () => []
    },
    variablesHelpText: {
      type: String,
      default() {
        return this.$t('WatermarkVariableHelpText')
      }
    }
  },
  data() {
    return {
      title: this.$t('BuiltinVariable')
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  methods: {
    onCopy(key) {
      copy(key)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .help-dialog.dialog .el-dialog__footer {
  border-top: none;
  padding: 8px;
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dee2e6;
}

::v-deep .help-table th,
::v-deep .help-table td {
  height: 40px;
  padding: 0 8px;
  text-align: left;
}

::v-deep .help-table .item-td,
::v-deep .help-table .item-label {
  cursor: pointer;
  color: var(--color-primary);
}
</style>
