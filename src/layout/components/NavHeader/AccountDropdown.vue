<template>
  <div class="header-tools header-profile">
    <el-dropdown>
      <span class="el-dropdown-link">
        <el-avatar :src="avatarUrl" class="header-avatar" />
        {{ currentUser.name }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-user" command="profile">{{ $t('common.nav.Profile') }}</el-dropdown-item>
        <el-dropdown-item icon="el-icon-guide" command="changePage">{{ $t('common.nav.UserPage') }}</el-dropdown-item>
        <el-dropdown-item icon="el-icon-key" command="apiKey">{{ $t('common.nav.APIKey') }}</el-dropdown-item>
        <el-dropdown-item divided command="logout">{{ $t('common.nav.Logout') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'AccountDropdown',
  data() {
    return {
      avatarUrl: require('@/assets/img/admin.png')
    }
  },
  computed: {
    ...mapGetters([
      'currentUser'
    ])
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
