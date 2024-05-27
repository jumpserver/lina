<template>
  <Dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    :title="$tc('CloudSyncConfig')"
    :show-buttons="false"
    :show-close="false"
    :visible.sync="iVisible"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-row>
      <el-col :span="4" style="height: 300px;">
        <el-steps direction="vertical" :active="active">
          <el-step :description="firstStepDesc" />
          <el-step :description="$tc('AuthConfig')" />
          <el-step :description="$tc('SyncAction')" />
        </el-steps>
      </el-col>
      <el-col :span="20">
        <ProviderPanel
          v-if="active===1"
          :providers="providers"
          :selected.sync="iSelected"
          :active.sync="active"
          :visible.sync="iVisible"
        />
        <AuthPanel
          v-if="active===2"
          ref="authPanel"
          :object.sync="account"
          :active.sync="active"
          :visible.sync="iVisible"
          :provider="iSelected"
        />
        <AssetPanel v-if="active===3" :object="account" :visible.sync="iVisible" />
        <TimingPanel v-if="active===4" :object="account" :visible.sync="iVisible" />
      </el-col>
    </el-row>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ProviderPanel from '@/views/assets/Cloud/Account/components/ProviderPanel'
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel'
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel'
import TimingPanel from '@/views/assets/Cloud/Account/components/TimingPanel'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'

export default {
  name: 'CreateDialog',
  components: {
    Dialog,
    AuthPanel,
    AssetPanel,
    TimingPanel,
    ProviderPanel
  },
  props: {
    providers: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      selected: '',
      firstStepDesc: this.$tc('SelectPlatforms'),
      active: 1,
      account: {}
    }
  },
  computed: {
    iSelected: {
      set(val) {
        const platformName = ACCOUNT_PROVIDER_ATTRS_MAP[val]?.title
        this.firstStepDesc = platformName || this.firstStepDesc
        this.selected = val
      },
      get() {
        return this.selected
      }
    },
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
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>
</style>
