<template>
  <GenericDetailPage :object.sync="Account" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="Account" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import StrategyDetail from './StrategyDetail'

export default {
  components: {
    GenericDetailPage,
    StrategyDetail,
    TabPage
  },
  data() {
    return {
      Account: {
        name: '', strategy_rules: [], strategy_actions: [], comment: ''
      },
      config: {
        url: `/api/v1/xpack/cloud/strategies`,
        activeMenu: 'StrategyDetail',
        submenu: [
          {
            title: this.$t('common.Strategy'),
            name: 'StrategyDetail'
          }
        ],
        actions: {
          deleteSuccessRoute: 'CloudCenter',
          updateCallback: () => {
            const id = this.$route.params.id
            const routeName = 'CloudStrategyUpdate'
            this.$router.push({
              name: routeName,
              params: { id: id }
            })
          }
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>

