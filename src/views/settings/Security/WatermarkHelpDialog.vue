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
    <p>{{ $t('WatermarkVariableHelpText') }}</p>
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
import { copy } from '@/utils/common'

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
      type: Object,
      default: () => ({})
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

  &::v-deep th, td {
    height: 40px;
    padding: 0 8px;
    text-align: left;
  }

  &::v-deep .item-td, .item-label {
    cursor: pointer;
    color: var(--color-primary);
  }
}
</style>
