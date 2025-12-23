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
    <p>{{ $t('VariableHelpText') }}</p>
    <table border="1" class="help-table">
      <tr>
        <th>{{ $tc('Variable') }}</th>
        <th>{{ $tc('Description') }}</th>
      </tr>
      <tr v-for="(val, key, index) in variables" :key="index">
        <td :title="$tc('ClickCopy')" class="item-td text-link" @click="onCopy(key)">
          <label class="item-label">{{ key }}</label>
        </td>
        <td><span>{{ val }}</span></td>
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
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      title: this.$t('BuiltinVariable'),
      variables: {}
    }
  },
  mounted() {
    this.$axios.get('/api/v1/ops/variables/help/').then((data) => {
      this.variables = data
    })
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
}

:deep(.help-table .item-td),
:deep(.help-table .item-label) {
  cursor: pointer;
  color: var(--color-primary);
}
</style>
