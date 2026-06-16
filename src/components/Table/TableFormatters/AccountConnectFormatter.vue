<template>
  <div>
    <el-dropdown
      :disabled="!hasPerm"
      :show-timeout="500"
      class="action-connect"
      size="small"
      trigger="hover"
      type="primary"
      @command="handleProtocolConnect"
      @visible-change="visibleChange"
    >
      <el-button plain size="small" type="primary" :disabled="!hasPerm" @click="handleBtnConnect">
        <i :class="iButtonIcon" :style="{ color: hasPerm ? '' : '#fff' }" />
      </el-button>

      <template v-if="!isClick" #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="title" disabled>
            <div v-if="getProtocolsLoading">
              {{ $t('Loading') }}
            </div>
            <div v-else>
              {{ dropdownTitle }}
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided />
          <el-dropdown-item v-for="protocol in protocols" :key="protocol.id" :command="protocol.name">
            {{ protocol.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'AccountConnectFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          can: () => true,
          getConnectUrl: (row, protocol, asset) => {
            const assetId = asset ? asset.id : row.asset.id
            return `/luna/admin-connect/?
              asset=${assetId}
              &account=${row.id}
              &protocol=${protocol}
              &org_id=${this.$store.getters.currentOrg.id}
            `.replace(/\s+/g, '')
          },
          asset: null,
          assetUrl: '/api/v1/assets/assets/{id}/',
          buttonIcon: 'fa fa-desktop'
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      protocols: [],
      isClick: false,
      getProtocolsLoading: false,
      dropdownTitle: this.$t('Protocols')
    }
  },
  computed: {
    iButtonIcon() {
      return this.formatterArgs.buttonIcon
    },
    hasPerm() {
      return this.formatterArgs.can({ row: this.row, cellValue: this.cellValue })
    }
  },
  methods: {
    handleProtocolConnect(protocol) {
      const url = this.formatterArgs.getConnectUrl(this.row, protocol, this.formatterArgs.asset)
      window.open(url, '_blank')
    },
    visibleChange(visible) {
      if (visible) {
        this.getProtocols(this.row.asset.id)
      }
    },
    async handleBtnConnect() {
      this.isClick = true
      if (this.protocols === 0) {
        await this.getProtocols(this.row.asset.id)
      }

      if (this.protocols.length > 0) {
        this.handleProtocolConnect(this.protocols[0].name)
      }
      setTimeout(() => {
        this.isClick = false
      }, 1000)
    },
    async getProtocols(assetId) {
      if (this.protocols.length > 0) return
      try {
        const url = this.formatterArgs.assetUrl.replace('{id}', assetId)
        const res = await this.$axios.get(url)

        this.protocols = res.protocols.filter(protocol => protocol.name !== 'winrm') || []
      } catch (e) {
        throw new Error(`Error getting protocols: ${e}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dropdown-menu__item.is-disabled {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

:deep(.action-connect .el-button:hover i),
:deep(.action-connect .el-button:focus i),
:deep(.action-connect .el-button:active i) {
  color: #fff !important;
}

:deep(.action-connect .el-button.el-button--primary.is-plain) {
  color: var(--color-primary);
  background-color: var(--color-primary-light-3, #e8f7f4);
  border-color: var(--color-primary-light-1, var(--color-primary));
}

:deep(.action-connect .el-button.el-button--primary.is-plain i) {
  color: var(--color-primary) !important;
}

:deep(.action-connect .el-button.el-button--primary.is-plain:hover),
:deep(.action-connect .el-button.el-button--primary.is-plain:focus),
:deep(.action-connect .el-button.el-button--primary.is-plain:active) {
  color: #fff;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

:deep(.el-dropdown-menu__item) {
  transition:
    height 0.3s ease-in-out,
    padding 0.3s ease-in-out;
  overflow: hidden;
}

:deep(.el-dropdown-menu) {
  transition: min-height 0.3s ease-in-out;
}
</style>
