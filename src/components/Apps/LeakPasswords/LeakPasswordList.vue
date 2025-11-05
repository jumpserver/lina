<template>
  <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" :create-drawer="createDrawer" />
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'

export default {
  name: 'LeakPasswordList',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      createDrawer: () => import('@/components/Apps/LeakPasswords/LeakPasswordsCreateUpdate.vue'),
      tableConfig: {
        url: '/api/v1/settings/leak-passwords/',
        columns: [
          'password'
        ],
        columnsMeta: {
          actions: {
            formatterArgs: {
              hasClone: false,
              canDelete: this.$hasPerm('settings.change_security'),
              canUpdate: this.$hasPerm('settings.change_security')
            }
          }
        }

      },
      headerActions: {
        hasExport: true,
        hasImport: true,
        importOptions: {
          encryptFields: [''], // 这里不加密 password，''只是为了保证数组有值
          canImportUpdate: false
        },
        hasCreate: true,
        hasSearch: true,
        hasRefresh: true,
        hasBulkDelete: true,
        hasBulkUpdate: false,
        hasLeftActions: true,
        hasRightActions: true,
        canCreate: this.$hasPerm('settings.change_security'),
        canBulkDelete: this.$hasPerm('settings.change_security')
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
