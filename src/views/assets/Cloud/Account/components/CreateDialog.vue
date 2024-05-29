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
          <el-step :description="$tc('Authentication')" />
          <el-step :description="$tc('Sync')" />
          <el-step :description="$tc('Result')" />
        </el-steps>
      </el-col>
      <el-col :span="20">
        <component
          :is="activeMenu"
          :provider="iSelected"
          :providers="providers"
          :selected.sync="iSelected"
          :active.sync="active"
          :object.sync="account"
          :visible.sync="iVisible"
        />
      </el-col>
    </el-row>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ProviderPanel from '@/views/assets/Cloud/Account/components/ProviderPanel'
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel'
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel'
import ResultPanel from '@/views/assets/Cloud/Account/components/ResultPanel'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'

export default {
  name: 'CreateDialog',
  components: {
    Dialog,
    AuthPanel,
    AssetPanel,
    ResultPanel,
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
      activeMenuMap: { 1: 'ProviderPanel', 2: 'AuthPanel', 3: 'AssetPanel', 4: 'ResultPanel' },
      activeMenu: 'ProviderPanel',
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
  watch: {
    active: {
      handler(v) {
        this.activeMenu = this.activeMenuMap[v]
      }
    }
  },
  methods: {
  }
}
</script>
