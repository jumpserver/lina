<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      config: {
        initial: {
        },
        url: '/api/v1/orgs/orgs/',
        fields: [
          ['', ['name', 'comment']]
          // [this.$t('common.Members'), ['admins', 'auditors', 'users']],
        ],
        hasSaveContinue: false,
        fieldsMeta: {
          // admins: {
          //   label: this.$t('xpack.Admin'),
          //   el: {
          //     value: [],
          //     ajax: {
          //       url: '/api/v1/users/users/?fields_size=mini&oid=DEFAULT',
          //       transformOption: (item) => {
          //         return { label: item.name + '(' + item.username + ')', value: item.id }
          //       }
          //     }
          //   }
          // },
          // auditors: {
          //   label: this.$t('xpack.Auditor'),
          //   el: {
          //     value: [],
          //     ajax: {
          //       url: '/api/v1/users/users/?fields_size=mini&oid=DEFAULT',
          //       transformOption: (item) => {
          //         return { label: item.name + '(' + item.username + ')', value: item.id }
          //       }
          //     }
          //   }
          // },
          // users: {
          //   label: this.$t('xpack.User'),
          //   el: {
          //     value: [],
          //     ajax: {
          //       url: '/api/v1/users/users/?fields_size=mini&oid=DEFAULT',
          //       transformOption: (item) => {
          //         return { label: item.name + '(' + item.username + ')', value: item.id }
          //       }
          //     }
          //   }
          // }
        },
        onPerformSuccess(res, method) {
          switch (method) {
            case 'post':
              this.$store.dispatch('users/addAdminOrg', { id: res.id, name: res.name })
              this.$message.success(this.$t('xpack.Organization.CreateOrgMsg'))
              return this.$router.push({ name: 'OrganizationList' })
            case 'put':
              this.$store.dispatch('users/modifyOrg', { id: res.id, name: res.name })
              this.$message.success(this.$t('common.updateSuccessMsg'))
              return this.$router.push({ name: 'OrganizationList' })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
