<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="terminal"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="terminal" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'

export default {
  name: 'TerminalDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail
  },
  data() {
    return {
      terminal: {},
      config: {
        url: '/api/v1/terminal/terminals',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('common.Detail'),
            'name': 'Detail'
          }
        ],
        hasRightSide: true,
        actions: {
          canUpdate: this.$hasPerm('terminal.change_terminal'),
          hasDelete: this.$hasPerm('terminal.delete_terminal'),
          canDelete: this.$hasPerm('terminal.delete_terminal'),
          detailApiUrl: `/api/v1/terminal/terminals/${this.$route.params.id}/`
        },
        titlePrefix: this.$t('sessions.terminalDetail')
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
