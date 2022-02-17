<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import PersonalInformationImprovement from './PersonalInformationImprovement'

export default {
  components: {
    GenericDetailPage,
    PersonalInformationImprovement
  },
  data() {
    return {
      user: {},
      config: {
        title: this.$t('users.FirstLogin'),
        activeMenu: 'PersonalInformationImprovement',
        submenu: [
          {
            title: this.$t('users.ImprovePersonalInformation'),
            name: 'PersonalInformationImprovement'
          }
        ],
        hasRightSide: false,
        actions: {
          detailApiUrl: '/api/v1/users/profile/'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
