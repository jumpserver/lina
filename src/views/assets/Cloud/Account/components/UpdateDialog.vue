<template>
  <Drawer
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('CloudAccountUpdate')"
    :visible.sync="iVisible"
    class="drawer"
    v-on="$listeners"
  >
    <IBox>
      <AuthPanel
        :object="object"
        :provider="object.provider.value"
        :visible.sync="iVisible"
        origin="update"
        @submitSuccess="onSubmitSuccess"
      />
    </IBox>
  </Drawer>
</template>

<script>
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel.vue'
import Drawer from '@/components/Drawer/index.vue'
import IBox from '@/components/Common/IBox/index.vue'

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
    onSubmitSuccess() {
      this.$emit('submitSuccess')
    }
  }
}
</script>

<style lang="scss" scoped>
.ibox {
  margin: 15px
}

.drawer ::v-deep {
  .el-drawer__body {
    background: #f3f3f3;
  }
}

</style>
