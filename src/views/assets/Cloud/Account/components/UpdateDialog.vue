<template>
  <Drawer
    v-model:visible="iVisible"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('CloudAccountUpdate')"
    class="drawer"
  >
    <IBox>
      <AuthPanel
        :object="object"
        :provider="object.provider.value"
        v-model:visible="iVisible"
        origin="update"
        @submit-success="onSubmitSuccess"
      />
    </IBox>
  </Drawer>
</template>

<script>
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel.vue'
import Drawer from '@/components/Drawer/index.vue'
import IBox from '@/components/Common/IBox/index.vue'
import { useVModel } from '@/utils/vue/useVModel'

export default {
  name: 'UpdateDialog',
  components: { Drawer, AuthPanel, IBox },
  props: {
    object: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'submitSuccess'],
  setup(props, { emit }) {
    const iVisible = useVModel(props, emit, 'visible')
    return {
      iVisible
    }
  },
  methods: {
    onSubmitSuccess() {
      this.$emit('submitSuccess')
    }
  }
}
</script>

<style lang="scss" scoped>
.ibox {
  margin: 15px;
}

.drawer :deep(.el-drawer__body) {
  background: #f3f3f3;
}
</style>
