<template>
  <div>
    <el-dropdown
      v-if="hasPerm"
      size="small"
      trigger="hover"
      :show-timeout="500"
      @command="handleCommand"
      @visible-change="visibleChange"
    >
      <el-button
        plain
        size="mini"
        type="primary"
        @click="handlePamConnect"
      >
        <i :class="IButtonIcon" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="Title" disabled>
          {{ ITitleText }}
        </el-dropdown-item>
        <el-dropdown-item divided />
        <el-dropdown-item
          v-for="protocol in protocols"
          :key="protocol.id"
          :command="protocol.name"
        >
          {{ protocol.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-button
      v-else
      plain
      size="mini"
      type="primary"
      :disabled="!hasPerm"
    >
      <i :class="IButtonIcon" style="color: #fff" />
    </el-button>
  </div>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'AccountConnectFormatter',
  extends: BaseFormatter,
  props: {
    buttonIcon: {
      type: String,
      default: 'fa fa-desktop'
    },
    titleText: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      hasPerm: false,
      protocols: []
    }
  },
  computed: {
    IButtonIcon() {
      return this.buttonIcon
    },
    ITitleText() {
      return this.titleText || this.$t('SelectProtocol')
    }
  },
  mounted() {
    this.hasPerm = this.formatterArgs.can()
  },
  methods: {
    handleCommand(protocol) {
      if (protocol === 'Title') return

      this.formatterArgs.setMapItem(this.row.id, protocol)
      this.handleWindowOpen(this.row, protocol)
    },
    visibleChange(visible) {
      if (visible) {
        this.getProtocols(this.row.asset.id)
      }
    },
    handleWindowOpen(row, protocol) {
      const url = this.formatterArgs.connectUrlTemplate(row) + `${protocol}`

      this.$nextTick(() => {
        window.open(url, '_blank')
      })
    },
    async handlePamConnect() {
      const protocolMap = this.$store.getters.protocolMap

      if (protocolMap.has(this.row.id)) {
        // 直连
        const protocol = protocolMap.get(this.row.id)
        this.handleWindowOpen(this.row, protocol)
      } else {
        try {
          const url = this.formatterArgs.url.replace('{id}', this.row.asset.id)
          const res = await this.$axios.get(url)

          if (res && res.protocols.length > 0) {
            const protocol = res.protocols.filter(protocol => protocol.name !== 'sftp')[0]

            this.formatterArgs.setMapItem(this.row.id, protocol.name)
            this.handleWindowOpen(this.row, protocol.name)
          }
        } catch (e) {
          throw new Error(`Error getting protocols: ${e}`)
        }
      }
    },
    async getProtocols(assetId) {
      try {
        const url = this.formatterArgs.url.replace('{id}', assetId)
        const res = await this.$axios.get(url)

        // 暂将 SFTP 过滤
        if (res) this.protocols = res.protocols.filter(protocol => protocol.name !== 'sftp')
      } catch (e) {
        throw new Error(`Error getting protocols: ${e}`)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.el-dropdown-menu__item.is-disabled {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

::v-deep .el-dropdown-menu__item {
  transition: height 0.3s ease-in-out, padding 0.3s ease-in-out;
  overflow: hidden;
}

::v-deep .el-dropdown-menu {
  transition: min-height 0.3s ease-in-out;
}
</style>
