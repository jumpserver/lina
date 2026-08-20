<template>
  <Dialog
    v-model:visible="iVisible"
    class="platform-detail-update-dialog"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('Update')"
    top="1vh"
    width="60%"
  >
    <GenericCreateUpdateForm v-bind="$data" @submit-success="submitSuccess" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'
import { useVModel } from '@/utils/vue/useVModel'
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
  setup(props, { emit }) {
    const iVisible = useVModel(props, emit, 'visible')
    return {
      iVisible
    }
  },
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

<style lang="scss">
.platform-detail-update-dialog .el-dialog__body {
  padding: 0 20px;
}
</style>
