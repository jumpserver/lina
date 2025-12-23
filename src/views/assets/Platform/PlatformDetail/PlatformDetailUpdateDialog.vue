<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('Update')"
    :visible="visible"
    top="1vh"
    width="60%"
  >
    <GenericCreateUpdateForm v-bind="$data" @submit-success="submitSuccess" />
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
  emits: ['update:visible'],
  data() {
    return {
      initial: {},
      successUrl: { name: 'Settings', params: { activeMenu: 'Basic' } },
      url: `/api/v1/assets/platforms/`,
      hasReset: false,
      hasDetailInMsg: false,
      submitMethod: () => 'patch',
      fields: [['', this.showFields]],
      fieldsMeta: platformFieldsMeta(this)
    }
  },
  created() {
    try {
      this.setOptions()
    } finally {
      this.$emit('update:visible', true)
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
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
  :deep(.el-dialog .el-dialog__body) {
    padding: 0 20px;
  }
</style>
