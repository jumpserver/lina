<template>
  <Drawer
    v-if="updateVisible"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('CloudAccountUpdate')"
    :visible.sync="updateVisible"
    v-on="$listeners"
  >
    <div style="background: white">
      <AuthPanel
        :object="object"
        :provider="object.provider.value"
        :visible.sync="updateVisible"
        origin="update"
        @submitSuccess="onSubmitSuccess"
      />
    </div>
  </Drawer>
</template>

<script>
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel.vue'
import Drawer from '@/components/Drawer/index.vue'

export default {
  name: 'UpdateDialog',
  components: { Drawer, AuthPanel },
  props: {
    object: {
      type: Object,
      required: true
    },
    updateVisible: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
