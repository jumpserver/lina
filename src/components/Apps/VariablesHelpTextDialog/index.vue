<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible="visible"
    class="help-dialog"
    top="1vh"
    width="50%"
    @update:visible="$emit('update:visible', $event)"
  >
    <p>{{ variablesHelpText }}</p>
    <table border="1" class="help-table">
      <tr>
        <th>{{ $tc('Variable') }}</th>
        <th>{{ $tc('Description') }}</th>
        <th>{{ $tc('Example') }}</th>
      </tr>
      <tr v-for="(item, index) in variables" :key="index">
        <td :title="$tc('ClickCopy')" class="item-td text-link" @click="onCopy(item.name)">
          <label class="item-label">{{ item.name }}</label>
        </td>
        <td>
          <span>{{ item.label }}</span>
        </td>
        <td>
          <span>{{ item.default }}</span>
        </td>
      </tr>
    </table>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
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
        return 'WatermarkVariableHelpText'
      }
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      title: this.$t('BuiltinVariable')
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
:deep(.help-dialog.dialog .el-dialog__footer) {
  border-top: none;
  padding: 8px;
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dee2e6;
}

:deep(.help-table) {
  th,
  td {
    height: 40px;
    padding: 0 8px;
    text-align: left;
  }

  .item-td,
  .item-label {
    cursor: pointer;
    color: var(--color-primary);
  }
}
</style>
