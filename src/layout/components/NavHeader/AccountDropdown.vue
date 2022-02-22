<template>
  <div class="header-tools header-profile">
    <el-dropdown :show-timeout="50" @command="handleClick">
      <span class="el-dropdown-link">
        <el-avatar :src="avatarUrl" class="header-avatar" />
        {{ currentUser.name }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-user" command="profile">{{ $t('common.nav.Profile') }}</el-dropdown-item>
        <el-dropdown-item icon="el-icon-key" command="apiKey">{{ $t('common.nav.APIKey') }}</el-dropdown-item>
        <el-dropdown-item divided command="logout"><svg-icon icon-class="logout" style="margin-right: 4px" />{{ $t('common.nav.Logout') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <ApiKey ref="api" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ApiKey from './ApiKey'

export default {
  name: 'AccountDropdown',
  components: {
    ApiKey
  },
  data() {
    return {
      avatarUrl: require('@/assets/img/admin.png'),
      showApiKey: false
    }
  },
  computed: {
    ...mapGetters([
      'currentUser',
      'currentRole',
      'currentOrgRoles',
      'orgs',
      'currentOrgPerms'
    ])
  },
  created() {
  },
  methods: {
    handleClick(val) {
      switch (val) {
        case 'profile':
          this.$router.push('/profile')
          break
        case 'logout':
          this.logout()
          window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
          break
        case 'apiKey':
          this.$refs.api.showApi()
          break
      }
    },
    logout() {
    }
  }
}
</script>

<style scoped>
  .header-avatar {
    height: 30px;
    width: 30px;
    margin-right: 5px;
    vertical-align: middle;
  }
</style>
