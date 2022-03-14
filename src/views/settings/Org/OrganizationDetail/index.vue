<template>
  <GenericDetailPage :object.sync="Organization" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="Organization" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import OrganizationDetail from './OrganizationDetail'
import OrganizationMembershipList from './OrganizationMembershipList'
import { getApiPath } from '@/utils/common'
const performDelete = function() {
  const url = getApiPath(this)
  return this.$axios.delete(url)
}
export default {
  components: {
    GenericDetailPage,
    OrganizationDetail,
    OrganizationMembershipList,
    TabPage
  },
  data() {
    return {
      Organization: {},
      config: {
        activeMenu: 'OrganizationDetail',
        url: '/api/v1/orgs/orgs',
        submenu: [
          {
            title: this.$t('xpack.Organization.OrganizationDetail'),
            name: 'OrganizationDetail'
          },
          {
            title: this.$t('xpack.Organization.OrganizationMembership'),
            name: 'OrganizationMembershipList'
          }
        ],
        actions: {
          deleteCallback: function() {
            const msg = this.$t('xpack.Organization.DeleteOrgMsg')
            const title = this.$t('xpack.Organization.DeleteOrgTitle')
            this.$alert(msg, title, {
              type: 'warning',
              confirmButtonClass: 'el-button--danger',
              showCancelButton: true,
              beforeClose: async(action, instance, done) => {
                if (action !== 'confirm') return done()
                instance.confirmButtonLoading = true
                try {
                  await performDelete.bind(this)()
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                  this.$router.push({ name: 'OrganizationList' })
                  return done()
                } catch (error) {
                  this.$log.error(error)
                } finally {
                  instance.confirmButtonLoading = false
                }
              }
            }).catch(() => {
              /* 取消*/
            })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
