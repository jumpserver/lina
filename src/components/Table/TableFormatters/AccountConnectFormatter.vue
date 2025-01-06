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
      <i class="fa fa-desktop" />
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="Title" disabled>
        可选协议
      </el-dropdown-item>
      <el-dropdown-item divided />
      <el-dropdown-item
        v-for="protocol in perm_protocols"
        :key="protocol.id"
        :command="protocol.name"
      >
        {{ protocol.name }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseFormatter from './base.vue'

export default {
  name: 'AccountConnectFormatter',
  extends: BaseFormatter,
  data() {
    return {
      perm_protocols: []
    }
  },
  computed: {
    ...mapGetters(['protocolMap'])
  },
  methods: {
    handleCommand(protocol) {
      this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
        key: this.row.id,
        value: protocol
      })

      this.handleWindowOpen(this.row, protocol)
    },
    visibleChange(visible) {
      if (visible) {
        this.getPermdProtocols(this.row.asset.id)
      }
    },
    getAssetDetail(id) {
      const detailUrl = `/api/v1/assets/assets/${id}`

      return new Promise((resolve, reject) => {
        this.$axios
          .get(detailUrl)
          .then(res => {
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    handleWindowOpen(row, protocol) {
      window.open(
        `/luna/pam_connect/${row.id}/${row.username}/${row.asset.id}/${row.asset.name}/${protocol}`,
        '_blank'
      )
    },
    async handlePamConnect() {
      const protocolMap = this.protocolMap

      if (protocolMap.has(this.row.id)) {
        const protocol = protocolMap.get(this.row.id)
        this.handleWindowOpen(this.row, protocol)
      } else {
        try {
          const res = await this.getAssetDetail(this.row.asset.id)

          if (res) {
            const protocol = res.protocols[0]

            this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
              key: this.row.id,
              value: protocol.name
            })

            this.handleWindowOpen(this.row, protocol.name)
          }
        } catch (e) {
          throw new Error(`Error for reaseon: ${e}`)
        }
      }
    },
    async getPermdProtocols(assetId) {
      try {
        const res = await this.getAssetDetail(assetId)

        if (res) {
          this.perm_protocols = res.protocols
        }
      } catch (e) {
        throw new Error(`Error for reaseon: ${e}`)
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
