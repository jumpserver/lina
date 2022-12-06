<template>
  <Dialog
    :title="$tc('common.Update')"
    :visible.sync="iVisible"
    width="60%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <GenericCreateUpdateForm v-bind="$data" @submitSuccess="submitSuccess" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
import { platformFieldsMeta } from '../const'

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
    showFields: {
      type: Array,
      default: () => []
    },
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      initial: {},
      successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
      url: `/api/v1/assets/platforms/`,
      hasReset: false,
      hasDetailInMsg: false,
      submitMethod: () => 'patch',
      fields: [['', this.showFields]],
      fieldsMeta: platformFieldsMeta(this)
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
    try {
      this.setOptions()
    } finally {
      this.iVisible = true
    }
  },
  methods: {
    async setOptions() {
      const { category, type } = this.object
      const url = `/api/v1/assets/categories/constraints/?category=${category.value}&type=${type.value}`
      const res = await this.$axios.get(url)
      this.fieldsMeta.protocols.el.choices = res['protocols'] || []
    },
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
