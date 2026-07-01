<template>
  <GenericListPage
    :header-actions="headerActions"
    :help-tip="helpText"
    :table-config="tableConfig"
  />
</template>

<script>
import {
  createVNode as createVNodeCompat,
  isVNode as isVNodeCompat,
  resolveComponent as resolveComponentCompat
} from 'vue'
import { GenericListPage } from '@/layout/components'
function _isSlot(s) {
  return (
    typeof s === 'function' ||
    (Object.prototype.toString.call(s) === '[object Object]' && !isVNodeCompat(s))
  )
}
export default {
  name: 'ConnectMethodListACL',
  components: {
    GenericListPage
  },
  data() {
    return {
      helpText: this.$t('ConnectMethodACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/connect-method-acls/',
        columnsExclude: ['users', 'assets', 'accounts'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'is_active', 'comment', 'actions']
        },
        columnsMeta: {
          connect_methods: {
            width: '240px',
            formatter: (row) => {
              const methods = Array.isArray(row.connect_methods) ? row.connect_methods : []
              const colors = ['success', 'warning', 'info', 'danger']
              return createVNodeCompat(
                'div',
                {
                  style: 'display: flex; flex-wrap: wrap; gap: 4px;'
                },
                [
                  methods.map((item, idx) =>
                    createVNodeCompat(
                      resolveComponentCompat('el-tag'),
                      {
                        key: idx,
                        size: 'small',
                        type: colors[idx % colors.length]
                      },
                      _isSlot(item)
                        ? item
                        : {
                            default: () => [item]
                          }
                    )
                  )
                ]
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
