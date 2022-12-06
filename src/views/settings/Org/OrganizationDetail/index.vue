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
const performDelete = function() {
  const url = `${this.url}/${this.$route.params.id}/`
  return this.$axios.delete(url)
}
export default {
  components: {
    GenericDetailPage,
    OrganizationDetail,
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
          }
        ],
        actions: {
          deleteApiUrl: `${this.url}/${this.$route.params.id}/`,
          canUpdate: this.$hasPerm('orgs.change_organization'),
          canDelete: this.$hasPerm('orgs.delete_organization'),
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
                  this.$message.success(this.$tc('common.deleteSuccessMsg'))
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
