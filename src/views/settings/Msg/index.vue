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
import Subscribe from './Subscribe/index.vue'
import SMS from './SMS/index.vue'

export default {
  name: 'Index',
  components: { TabPage, Email, Subscribe, SMS },
  data() {
    return {
      activeMenu: 'Email',
      submenu: [
        {
          title: this.$t('setting.Email'),
          name: 'Email',
          hidden: !this.$hasPerm('settings.change_email')
        },
        {
          title: this.$t('setting.SMS'),
          name: 'SMS',
          hidden: !this.$hasPerm('settings.change_sms') || !this.$store.getters.hasValidLicense
        },
        {
          title: this.$t('setting.MsgSubscribe'),
          name: 'Subscribe',
          hidden: !this.$hasPerm('settings.change_systemmsgsubscription')
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
