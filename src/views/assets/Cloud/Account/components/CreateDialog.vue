<template>
  <Drawer
    v-bind="$attrs"
    v-model:visible="iVisible"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :destroy-on-close="true"
    :has-footer="false"
    :show-buttons="false"
    :show-close="true"
    :title="$tc('CloudSyncConfig')"
  >
    <div class="cloud-create-dialog">
      <div class="left-step-zone">
        <el-steps :active="active" direction="vertical">
          <el-step :description="firstStepDesc" />
          <el-step :description="$tc('Authentication')" />
          <el-step :description="$tc('Sync')" />
          <el-step :description="$tc('Result')" />
        </el-steps>
      </div>
      <div class="right-content">
        <component
          :is="activeMenu"
          v-model:active="active"
          v-model:object="account"
          v-model:selected="iSelected"
          v-model:visible="iVisible"
          :provider="iSelected"
          :providers="providers"
        />
      </div>
    </div>
  </Drawer>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import Drawer from '@/components/Drawer'
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel'
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel'
import ProviderPanel from '@/views/assets/Cloud/Account/components/ProviderPanel'
import ResultPanel from '@/views/assets/Cloud/Account/components/ResultPanel'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'
import { useVModel } from '@/utils/vue/useVModel'

export default {
  name: 'CreateDialog',
  components: {
    IBox,
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
  emits: ['update:visible'],
  setup(props, { emit }) {
    const iVisible = useVModel(props, emit, 'visible')
    return {
      iVisible
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
    }
  },
  watch: {
    active: {
      handler(v) {
        this.activeMenu = this.activeMenuMap[v]
      }
    },
    iVisible(val) {
      if (!val) {
        this.resetState()
      }
    }
  },
  methods: {
    resetState() {
      this.active = 0
      this.activeMenu = 'ProviderPanel'
      this.selected = ''
      this.account = {}
      this.firstStepDesc = this.$tc('SelectProvider')
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-drawer__body) {
  overflow-x: hidden;

  .drawer__content {
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.cloud-create-dialog {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 0;
  padding: 10px;
  background: #f3f3f3;
  align-items: start;
}

.left-step-zone {
  border-right: solid 1px var(--color-border);
  align-self: start;
  height: 350px;

  .el-steps {
    padding-left: 15px;
  }
}

.right-content {
  min-width: 0;

  :deep(.el-form) {
    padding: 20px 20px 20px 10px;
    background: #fff;
  }

  :deep(.form-buttons),
  :deep(.buttons),
  :deep(.result-panel__actions) {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  :deep(.form-buttons .el-button),
  :deep(.buttons .el-button),
  :deep(.result-panel__actions .el-button) {
    padding: 8px 12px;
    border-color: var(--color-border);
    font-weight: 400;
    height: 30px;
  }
}

@media (max-width: 992px) {
  .cloud-create-dialog {
    grid-template-columns: minmax(0, 1fr);
  }

  .left-step-zone {
    min-height: auto;
    border-right: 0;
    border-bottom: solid 1px var(--color-border);
    padding-bottom: 12px;
    margin-bottom: 12px;
  }
}

:deep(.el-step) {
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
