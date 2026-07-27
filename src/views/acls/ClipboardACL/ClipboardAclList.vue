<template>
  <GenericListPage
    :header-actions="headerActions"
    :help-tip="helpMsg"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { createVNode, resolveComponent } from 'vue'
import { filterClipboardOperations, getClipboardOperationOptions } from './const'

export default {
  name: 'ClipboardAclList',
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMsg: this.$t('ClipboardACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/clipboard-acls/',
        columnsExclude: [
          'users',
          'assets',
          'accounts',
          'copy_text_limit',
          'paste_text_limit',
          'download_file_size_limit',
          'upload_file_size_limit',
          'reviewers'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'operations', 'action', 'priority', 'is_active', 'comment', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'ClipboardACLDetail'
            }
          },
          operations: {
            formatter: (row) => {
              const operations = filterClipboardOperations(row.operations)
              return createVNode(
                'div',
                {
                  style: 'display: flex; flex-wrap: wrap; gap: 4px;'
                },
                operations.map((item) =>
                  createVNode(
                    resolveComponent('el-tag'),
                    {
                      key: item.value || item.label,
                      size: 'small',
                      type: item.value === 'copy' ? 'success' : 'warning'
                    },
                    {
                      default: () => item.label || item.value
                    }
                  )
                )
              )
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'ClipboardACLUpdate',
              cloneRoute: 'ClipboardACLCreate'
            }
          }
        }
      },
      updateRoute: 'ClipboardACLUpdate',
      headerActions: {
        createRoute: 'ClipboardACLCreate',
        searchConfig: {
          exclude: ['operations'],
          options: [
            {
              label: this.$t('Operations'),
              type: 'choice',
              value: 'operations',
              children: getClipboardOperationOptions(this)
            }
          ]
        },
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
