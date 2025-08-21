<template>
  <TwoCol>
    <ListTable v-bind="config" />
  </TwoCol>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'
import { toM2MJsonParams } from '@/utils/jms/index'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'User',
  components: {
    TwoCol,
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
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
            'name', 'username', 'email', 'groups', 'system_roles',
            'org_roles', 'source', 'is_valid'
          ],
          columnsShow: {
            min: ['name', 'username'],
            default: ['name', 'username', 'email']
          },
          columnsMeta: {
            name: {
              label: this.$t('Name'),
              formatter: DetailFormatter,
              formatterArgs: {
                getRoute: ({ row }) => {
                  return {
                    name: 'UserDetail',
                    params: { id: row.id }
                  }
                }
              }
            },
            system_roles: {
              label: this.$t('SystemRoles'),
              formatter: (row) => {
                return row['system_roles'].map(item => item['display_name']).join(', ') || '-'
              },
              filters: [],
              columnKey: 'system_roles'
            },
            org_roles: {
              label: this.$t('OrgRoles'),
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
