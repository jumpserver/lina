<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AccountListTable
        ref="ListTable"
        :asset="object"
        :url="url"
        :columns="columns"
        :has-clone="false"
        :has-left-actions="false"
        :has-import="false"
        :has-export="false"
      />
    </el-col>
    <el-col :md="9" :sm="24">
      <IBox type="primary" :title="$tc('assets.Account')">
        <table style="width: 100%">
          <tr>
            <td colspan="2">
              <el-input
                v-model="relation.username"
                :placeholder="this.$t('perms.AddAccountToPerm')"
              />
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-button size="small" type="primary" @click="addAccount">
                {{ $t('common.Add') }}
              </el-button>
            </td>
          </tr>
        </table>
        <tr v-for="(username, i) of object['accounts']" :key="i" class="item">
          <td class="item-name" style="">
            <b>{{ username }}</b>
          </td>
          <td class="item-btn">
            <el-button
              size="mini"
              type="danger"
              style="float: right"
              :disabled="relation.disabled"
              @click="removeAccount(username)"
            >
              <i class="fa fa-minus" />
            </el-button>
          </td>
        </tr>
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import { AccountListTable } from '@/components'
import { IBox } from '@/components'

export default {
  name: 'AssetPermissionAccount',
  components: {
    IBox,
    AccountListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/perms/asset-permissions/${this.object.id}/accounts/`,
      columns: [
        'name', 'asset', 'username', 'version', 'privileged',
        'secret_type', 'date_created', 'date_updated', 'actions'
      ],
      relation: {
        disabled: false,
        username: ''
      }
    }
  },
  methods: {
    async removeAccount(username) {
      const url = `/api/v1/perms/asset-permissions/${this.object.id}/`
      const accounts = (this.object['accounts'] || []).filter(item => item !== username)
      this.$axios.patch(url, { accounts: accounts }).then(() => {
        this.object.accounts = accounts
        this.$refs.ListTable.refresh()
      })
    },
    async addAccount() {
      const url = `/api/v1/perms/asset-permissions/${this.object.id}/`
      if (!this.relation.username) {
        return
      }
      const accounts = this.object['accounts'].concat([this.relation.username])
      console.log('Accounts: ', accounts)
      this.$axios.patch(url, { accounts: accounts }).then(() => {
        this.object.accounts.push(this.relation.username)
        this.$refs.ListTable.refresh()
      })
    }
  }
}
</script>

<style scoped>
.item-name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
