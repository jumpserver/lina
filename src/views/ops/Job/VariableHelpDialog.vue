<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="iVisible"
    class="help-dialog"
    width="50%"
    top="1vh"
  >
    <p>{{ $t('ops.VariableHelpText') }}</p>
    <table class="help-table" border="1">
      <tr>
        <th>{{ $tc('ops.Variable') }}</th>
        <th>{{ $tc('ops.Description') }}</th>
      </tr>
      <tr v-for="(val, key, index) in variables" :key="index">
        <td class="item-td text-link" :title="$tc('common.ClickCopy')" @click="onCopy(key)">
          <label class="item-label">{{ key }}</label>
        </td>
        <td><span>{{ val }}</span></td>
      </tr>
    </table>
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'
import { copy } from '@/utils/common'

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
  data() {
    return {
      title: this.$t('ops.BuiltinVariable'),
      variables: {}
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
  mounted() {
    this.$axios.get('/api/v1/ops/variables/help').then((data) => {
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

<style>
.help-dialog.dialog .el-dialog__footer {
  border-top: none;
  padding: 8px;
}
</style>

<style lang="scss" scoped>
.help-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dee2e6;
  &>>> th, td {
    height: 40px;
    padding: 0 8px;
    text-align: left;
  }
  &>>> .item-td, .item-label {
    cursor: pointer;
    color: var(--color-primary);
  }
}
</style>
