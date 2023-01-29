<template>
  <div>
    <ListTable ref="ListTable" v-bind="$data" />
    <UploadDialog v-if="uploadDialogVisible" :visible.sync="uploadDialogVisible" @upload-event="handleUpload" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import UploadDialog from './UploadDialog'
export default {
  name: 'Applets',
  components: {
    ListTable,
    UploadDialog
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/terminal/applets/',
        columnsShow: {
          min: ['icon', 'name', 'version', 'author', 'protocols', 'actions'],
          default: [
            'icon', 'name', 'version', 'author', 'protocols',
            'type', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          icon: {
            align: 'center',
            width: '60px',
            formatter: (row) => {
              return <img src={row.icon} width='30' height='30' alt='icon'></img>
            }
          },
          name: {
            formatter: function(row) {
              return <span>{row.display_name}</span>
            },
            formatterArgs: {
              getTitle: ({ row }) => row['display_name'],
              getIcon: ({ row }) => row['icon']
            }
          },
          version: {
            width: '80px'
          },
          type: {
            width: '80px'
          },
          protocols: {
            showOverflowTooltip: false,
            formatter: (row) => {
              const dom = row.protocols.map(tag => {
                return <el-tag size='mini'>{ tag }</el-tag>
              })
              return <div class='dom'> {dom} </div>
            }
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false
            }
          }
        }
      },
      headerActions: {
        onCreate: () => {
          this.uploadDialogVisible = true
        },
        hasExport: false,
        hasImport: false
        // moreCreates: {
        //   callback: (option) => {
        //     this.uploadDialogVisible = true
        //   },
        //   dropdown: [
        //     {
        //       title: this.$t('common.OfflineUpload'),
        //       name: 'ByUpload'
        //     }
        //     {
        //       title: this.$t('common.Online'),
        //       name: 'Online'
        //     }
        //    ]
        // }
      }
    }
  },
  methods: {
    handleUpload(res) {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.dom {
  white-space: initial;
  .el-tag {
    margin-right: 3px;
  }
}
</style>
