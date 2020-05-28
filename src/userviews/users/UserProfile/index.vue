<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ProfileInfo from './ProfileInfo'
import ProfileUpdate from './ProfileUpdate'
import PasswordUpdate from './PasswordUpdate'
import SSHUpdate from './SSHUpdate'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    ProfileInfo,
    ProfileUpdate,
    PasswordUpdate,
    SSHUpdate
  },
  data() {
    return {
      user: {},
      config: {
        title: this.$t('common.nav.Profile'),
        activeMenu: 'ProfileInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ProfileInfo'
          },
          {
            title: '设置个人信息',
            name: 'ProfileUpdate'
          },
          {
            title: '设置登录密码',
            name: 'PasswordUpdate'
          },
          {
            title: '设置SSH公钥',
            name: 'SSHUpdate'
          }
        ],
        hasRightSide: false
      }
    }
  }
}
</script>

<style scoped>
</style>
