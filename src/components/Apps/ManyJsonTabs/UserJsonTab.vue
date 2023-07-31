<template>
  <el-row :gutter="24">
    <el-col :md="20" :sm="22">
      <ListTable v-bind="config" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'
import { toM2MJsonParams } from '@/utils/jms'

export default {
  name: 'User',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const [key, value] = toM2MJsonParams(this.object.users)
    return {
      config: {
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false
        },
        tableConfig: {
          url: `/api/v1/users/users/?${key}=${value}`,
          columns: [
            'name', 'username', 'groups', 'system_roles',
            'org_roles', 'source', 'is_valid'
          ],
          columnsMeta: {
            name: {
              label: this.$t('common.Name'),
              formatter: (row) => {
                const to = {
                  name: 'UserDetail',
                  params: { id: row.id }
                }
                if (this.$hasPerm('users.view_user')) {
                  return <router-link to={to} class='text-link'>{row.name}</router-link>
                } else {
                  return <span>{row.name}</span>
                }
              }
            },
            system_roles: {
              label: this.$t('users.SystemRoles'),
              formatter: (row) => {
                return row['system_roles'].map(item => item['display_name']).join(', ') || '-'
              },
              filters: [],
              columnKey: 'system_roles'
            },
            org_roles: {
              label: this.$t('users.OrgRoles'),
              formatter: (row) => {
                return row['org_roles'].map(item => item['display_name']).join(', ') || '-'
              },
              filters: [],
              columnKey: 'org_roles',
              has: () => {
                return this.$store.getters.hasValidLicense && !this.currentOrgIsRoot
              }
            },
            actions: {
              has: false
            }
          }
        }
      }
    }
  },
  computed: {
    iUrl() {
      return `/api/v1/users/users/`
    }
  }
}
</script>

<style scoped>

</style>
