<template>
  <Drawer
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    :has-footer="false"
    :show-buttons="false"
    :show-close="false"
    :title="$tc('CloudSyncConfig')"
    :visible.sync="iVisible"
    v-bind="$attrs"
    width="1051px"
    v-on="$listeners"
  >
    <el-row :gutter="5" style="padding: 10px">
      <el-col :span="6" class="left-step-zone">
        <el-steps :active="active" direction="vertical">
          <el-step :description="firstStepDesc" />
          <el-step :description="$tc('Authentication')" />
          <el-step :description="$tc('Sync')" />
          <el-step :description="$tc('Result')" />
        </el-steps>
      </el-col>
      <el-col :span="18">
        <component
          :is="activeMenu"
          :active.sync="active"
          :object.sync="account"
          :provider="iSelected"
          :providers="providers"
          :selected.sync="iSelected"
          :visible.sync="iVisible"
        />
      </el-col>
    </el-row>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import ProviderPanel from '@/views/assets/Cloud/Account/components/ProviderPanel'
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel'
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel'
import ResultPanel from '@/views/assets/Cloud/Account/components/ResultPanel'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'

export default {
  name: 'CreateDialog',
  components: {
    Drawer,
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
      activeMenuMap: { 0: 'ProviderPanel', 1: 'AuthPanel', 2: 'AssetPanel', 3: 'ResultPanel' },
      activeMenu: 'ProviderPanel',
      selected: '',
      firstStepDesc: this.$tc('SelectProvider'),
      active: 0,
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
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  min-width: 1051px !important;
  max-width: 1056px !important;
}

.left-step-zone {
  border-right: solid 1px var(--color-border);
  height: 350px;

  .el-steps {
    padding-left: 15px;
  }
}

::v-deep .el-step {
  .el-step__head {
    &.is-process {
      color: var(--color-primary);

      .el-step__icon {
        border-color: var(--color-primary);
      }
    }

    &.is-finish {
      .el-step__line {
        background-color: var(--color-primary);
      }

    }
  }

  .el-step__main {
    .el-step__description.is-process,
    .el-step__description.is-finish {
      color: var(--color-primary);
    }
  }
}
</style>
