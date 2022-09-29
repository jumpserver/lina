<template>
  <Dialog
    v-if="iVisible"
    :title="$tc('common.Update')"
    :visible.sync="iVisible"
    width="60%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
import { fieldsMeta } from '../const'

export default {
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      config: {
        successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
        url: `/api/v1/assets/platforms/`,
        hasReset: false,
        hasDetailInMsg: false,
        submitMethod: () => 'patch',
        fields: [
          ['', this.fields]
        ],
        fieldsMeta
      }
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() { return this.visible }
    }
  },
  created() {
  },
  methods: {
    submitSuccess() {
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  ::v-deep .el-dialog .el-dialog__body {
    padding: 0 20px;
  }

</style>
