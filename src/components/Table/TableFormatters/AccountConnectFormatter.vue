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
        <i :class="iButtonIcon" />
      </el-button>

      <template #dropdown>
        <el-dropdown-menu v-if="!isClick">
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
.action-connect {
  :deep(.el-button.el-button--small) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    min-width: 28px;
    height: 28px;
    min-height: 28px;
    padding: 0 !important;
    border: 1px solid rgba(26, 179, 148, 0.26);
    border-radius: var(--radius-control);
    background: rgba(26, 179, 148, 0.04) !important;
    box-shadow: none !important;
    color: var(--color-primary) !important;
    line-height: 1;

    &:hover,
    &:focus {
      border-color: rgba(26, 179, 148, 0.34) !important;
      background: rgba(26, 179, 148, 0.08) !important;
      color: var(--color-primary) !important;
    }

    &:active {
      border-color: rgba(26, 179, 148, 0.42) !important;
      background: rgba(26, 179, 148, 0.12) !important;
      color: var(--color-primary) !important;
    }

    i,
    .svg-icon {
      width: 14px;
      height: 14px;
      margin: 0 !important;
      font-size: 14px;
      font-style: normal;
      line-height: 14px;
      color: currentColor !important;
    }

    i.fa {
      font-family: FontAwesome !important;
    }

    [class^='el-icon-'],
    [class*=' el-icon-'] {
      font-family: element-icons !important;
    }
  }
}

.el-dropdown-menu__item.is-disabled {
  font-weight: 500;
  color: var(--el-text-color-secondary);
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
