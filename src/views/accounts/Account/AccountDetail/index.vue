<template>
  <div>
    <GenericDetailPage
      :active-menu.sync="config.activeMenu"
      :object.sync="account"
      v-bind="config"
      v-on="$listeners"
    >
      <keep-alive>
        <component :is="config.activeMenu" :object="account" />
      </keep-alive>
    </GenericDetailPage>
    <AccountCreateUpdate
      v-if="AccountVisible"
      :account="account"
      :asset="account.asset"
      :title="$tc('assets.UpdateAccount')"
      :visible.sync="AccountVisible"
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
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
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
    }
  }
}
</script>

<style scoped>

</style>
