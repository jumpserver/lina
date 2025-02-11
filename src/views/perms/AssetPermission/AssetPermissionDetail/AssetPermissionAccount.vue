<template>
  <TwoCol>
    <template>
      <AccountListTable
        ref="ListTable"
        :asset="object"
        :has-clone="false"
        :has-column-actions="false"
        :has-delete-action="false"
        :has-export="false"
        :has-import="false"
        :has-left-actions="false"
        :url="url"
        v-bind="tableConfig"
      />
    </template>
    <template #right>
      <IBox :title="$tc('Account')" type="primary">
        <AccountFormatter
          :assets="assetIds"
          :nodes="nodeIds"
          :value="object['accounts']"
          class="checkbox-accounts"
          @change="updateAccount"
        />
      </IBox>
    </template>
  </TwoCol>
</template>

<script>
import { AccountListTable, IBox } from '@/components'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { AccountConnectFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AssetPermissionAccount',
  components: {
    TwoCol,
    IBox,
    AccountFormatter,
    AccountListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const id = this.object.id
    const url = id ? `/api/v1/perms/asset-permissions/${id}/accounts/` : ''
    return {
      url: url,
      relation: {
        disabled: false,
        username: ''
      },
      tableConfig: {
        columnsMeta: {
          connect: {
            label: this.$t('Connect'),
            width: '80px',
            formatter: AccountConnectFormatter,
            formatterArgs: {
              buttonIcon: 'fa fa-desktop',
              titleText: '可选协议',
              url: '/api/v1/assets/assets/{id}',
              connectUrlTemplate: (row) => `/luna/pam_connect/${row.id}/${row.username}/${row.asset.id}/${row.asset.name}/`,
              setMapItem: (id, protocol) => {
                this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
                  key: id,
                  value: protocol
                })
              }
            }
          }
        }
      }
    }
  },
  computed: {
    assetIds() {
      return this.object.assets.map(asset => asset.id)
    },
    nodeIds() {
      return this.object.nodes.map(node => node.id)
    }
  },
  methods: {
    async updateAccount(accounts) {
      const url = `/api/v1/perms/asset-permissions/${this.object.id}/`
      this.$axios.patch(url, { accounts: accounts }).then(() => {
        this.object.accounts = accounts
        this.$refs.ListTable.refresh()
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.checkbox-accounts ::v-deep .el-checkbox-group {
  line-height: 40px;
}

.item-name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
