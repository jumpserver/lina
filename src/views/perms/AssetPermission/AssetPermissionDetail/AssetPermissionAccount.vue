<template>
  <TwoCol>
    <template>
      <AccountListTable
        ref="ListTable"
        :asset="object"
        :columns-default="columns"
        :has-clone="false"
        :has-column-actions="false"
        :has-delete-action="false"
        :has-export="false"
        :has-import="false"
        :has-left-actions="false"
        :show-quick-filters="false"
        :url="url"
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
      columns: ['name', 'username', 'secret', 'asset', 'connect']
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
