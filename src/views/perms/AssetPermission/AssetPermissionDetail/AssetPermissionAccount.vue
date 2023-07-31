<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AccountListTable
        ref="ListTable"
        :asset="object"
        :has-clone="false"
        :has-export="false"
        :has-import="false"
        :has-delete-action="false"
        :has-left-actions="false"
        :has-column-actions="false"
        :url="url"
      />
    </el-col>
    <el-col :md="9" :sm="24">
      <IBox :title="$tc('assets.Account')" type="primary">
        <AccountFormatter
          class="checkbox-accounts"
          :value="object['accounts']"
          :assets="assetIds"
          :nodes="nodeIds"
          @change="updateAccount"
        />
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import { AccountListTable } from '@/components'
import { IBox } from '@/components'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'

export default {
  name: 'AssetPermissionAccount',
  components: {
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

<style scoped lang="scss">

.checkbox-accounts >>> .el-checkbox-group {
  line-height: 40px;
}

.item-name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
