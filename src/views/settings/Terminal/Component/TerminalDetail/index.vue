<template>
  <GenericDetailPage
    v-model:active-menu="config.activeMenu"
    v-model:object="terminal"
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
            'title': this.$t('Basic'),
            'name': 'Detail'
          }
        ],
        hasRightSide: true,
        actions: {
          canUpdate: this.$hasPerm('terminal.change_terminal'),
          hasDelete: this.$hasPerm('terminal.delete_terminal'),
          canDelete: this.$hasPerm('terminal.delete_terminal')
        },
        titlePrefix: this.$t('TerminalDetail')
      }
    }
  },
  mounted() {
  }
}
</script>
