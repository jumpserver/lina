<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import Email from './Email/index.vue'
import MsgTemplate from '@/views/settings/Msg/MsgTemplate/index.vue'
import Subscribe from './Subscribe/index.vue'
import SMS from './SMS/index.vue'

export default {
  name: 'Index',
  components: { TabPage, Email, MsgTemplate, Subscribe, SMS },
  data() {
    return {
      activeMenu: 'Email',
      submenu: [
        {
          title: this.$t('Email'),
          name: 'Email',
          hidden: !this.$hasPerm('settings.change_email')
        },
        {
          title: this.$t('Msg Template'),
          name: 'MsgTemplate',
          hidden: !this.$hasPerm('settings.change_email')
        },
        {
          title: this.$t('SMS'),
          name: 'SMS',
          hidden: !this.$hasPerm('settings.change_sms') || !this.$store.getters.hasValidLicense
        },
        {
          title: this.$t('MsgSubscribe'),
          name: 'Subscribe',
          hidden: !this.$hasPerm('settings.change_systemmsgsubscription')
        }
      ]
    }
  }
}
</script>
