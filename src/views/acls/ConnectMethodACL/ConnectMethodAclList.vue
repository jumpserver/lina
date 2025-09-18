<template>
  <GenericListPage :header-actions="headerActions" :help-tip="helpText" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  name: 'ConnectMethodListACL',
  components: { GenericListPage },
  data() {
    return {
      helpText: this.$t('ConnectMethodACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/connect-method-acls/',
        columnsExclude: ['users', 'assets', 'accounts'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'is_active', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          'connect_methods': {
            width: '240px',
            formatter: (row) => {
              const methods = Array.isArray(row.connect_methods) ? row.connect_methods : []
              const colors = ['success', 'warning', 'info', 'danger']

              return (
                <div style='display: flex; flex-wrap: wrap; gap: 4px;'>
                  {methods.map((item, idx) => (
                    <el-tag
                      key={idx}
                      size='small'
                      type={colors[idx % colors.length]}
                    >
                      {item}
                    </el-tag>
                  ))}
                </div>
              )
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
