<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="user">
    <el-alert
      v-if="accountMismatch"
      :title="$t('ClientCredentialsAccountMismatch')"
      type="warning"
      :closable="false"
    />
    <keep-alive v-else>
      <SessionPreferences
        v-if="['Client', 'Web'].includes(config.activeMenu)"
        :key="config.activeMenu"
        :scope="config.activeMenu"
      />
      <ClientCredentials
        v-else
        :key="config.activeMenu"
        :credential-type="config.activeMenu === 'FileEncryption' ? 'file' : 'lock'"
        :object="user"
      />
    </keep-alive>
  </GenericDetailPage>
</template>
<script>
import { GenericDetailPage } from '@/layout/components'
import ClientCredentials from './ClientCredentials.vue'
import SessionPreferences from './SessionPreferences.vue'
export default {
  components: { GenericDetailPage, ClientCredentials, SessionPreferences },
  data() {
    const tabs = ['Web', 'Client', 'LockPassword', 'FileEncryption']
    return {
      user: this.$store.state.users.profile,
      config: {
        title: this.$t('PersonalSecurity.Title'),
        activeMenu: tabs.includes(this.$route.query.tab) ? this.$route.query.tab : 'Web',
        submenu: tabs.map((name) => ({ name, title: this.$t('PersonalSecurity.' + name) })),
        hasRightSide: false,
        hasActivity: false,
        actions: { detailApiUrl: '/api/v1/users/profile/' }
      }
    }
  },
  computed: {
    accountMismatch() {
      const expected = this.$route.query.user_id
      return Boolean(expected && expected !== this.$store.state.users.profile.id)
    }
  }
}
</script>
