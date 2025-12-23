<template>
  <div>
    <GenericDetailPage
      v-model:active-menu="config.activeMenu"
      v-model:object="account"
      v-bind="config"
      v-on="$listeners"
    >
      <keep-alive>
        <component :is="config.activeMenu" :object="account" />
      </keep-alive>
    </GenericDetailPage>
    <AccountCreateUpdate
      v-if="AccountVisible"
      v-model:visible="AccountVisible"
      :account="account"
      :asset="account.asset"
      :title="$tc('UpdateAccount')"
      @add="addAccountSuccess"
    />
  </div>
</template>

<script>
import Detail from './Detail.vue'
import { GenericDetailPage, TabPage } from '@/layout/components'
import AccountCreateUpdate from '@/components/Apps/AccountListTable/AccountCreateUpdate.vue'

export default {
  components: {
    TabPage,
    Detail,
    GenericDetailPage,
    AccountCreateUpdate
  },
  data() {
    return {
      AccountVisible: false,
      account: {},
      config: {
        url: '/api/v1/accounts/accounts',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          }
        ],
        actions: {
          hasUpdate: () => true,
          updateCallback: () => {
            const vm = this
            vm.AccountVisible = false
            setTimeout(() => {
              vm.AccountVisible = true
            })
          }
        }
      }
    }
  },
  methods: {
    addAccountSuccess() {
      this.$store.commit('common/reload')
    },
    getPageTitle({ row }) {
      return `${row.username}@${row.asset.name}`
    }
  }
}
</script>
