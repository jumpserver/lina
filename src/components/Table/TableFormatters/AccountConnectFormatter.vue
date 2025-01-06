<template>
  <el-dropdown
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
    },
    connectUrlTemplate: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      protocols: []
    }
  },
  computed: {
    IButtonIcon() {
      return this.buttonIcon
    },
    ITitleText() {
      return this.titleText || this.$t('OptionalProtocol')
    }
  },
  methods: {
    handleCommand(protocol) {
      if (protocol === 'Title') return

      this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
        key: this.row.id,
        value: protocol
      })

      this.handleWindowOpen(this.row, protocol)
    },
    visibleChange(visible) {
      if (visible) {
        this.getProtocols(this.row.asset.id)
      }
    },
    handleWindowOpen(row, protocol) {
      const url = this.formatterArgs.connectUrlTemplate
        .replace('{id}', row.id)
        .replace('{username}', row.username)
        .replace('{assetId}', row.asset.id)
        .replace('{assetName}', row.asset.name)
        .replace('{protocol}', protocol)

      window.open(url, '_blank')
    },
    async handlePamConnect() {
      const protocolMap = this.$store.getters.protocolMap

      if (protocolMap.has(this.row.id)) {
        const protocol = protocolMap.get(this.row.id)
        this.handleWindowOpen(this.row, protocol)
      } else {
        try {
          const url = this.formatterArgs.url.replace('{id}', this.row.asset.id)
          const res = await this.$axios.get(url)

          if (res && res.protocols.length > 0) {
            const protocol = res.protocols[0]

            this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
              key: this.row.id,
              value: protocol.name
            })

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

        if (res) this.protocols = res.protocols
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
