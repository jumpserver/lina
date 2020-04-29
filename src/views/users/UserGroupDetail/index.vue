<template>
  <GenericDetailPage :object.sync="group" v-bind="config">
    <template #info>
      <div is="TabDetail" :group="group" />
    </template>
    <template #assetPermissions>
      <div is="UserGroupPerm" :group="group" />
    </template>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import UserGroupPerm from './perms'
import TabDetail from './detail'

export default {
  components: {
    GenericDetailPage,
    UserGroupPerm,
    TabDetail
  },
  data() {
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        activeMenu: 'info',
        submenu: [
          {
            title: this.$tc('Basic Info'),
            name: 'info'
          },
          {
            title: this.$t('perms.Asset permissions'),
            name: 'assetPermissions'
          }
        ],
        actions: {
          canDelete: true,
          canUpdate: true
        }
      }
    }
  },
  methods: {}
}
</script>

<style lang='scss' scoped>

</style>
