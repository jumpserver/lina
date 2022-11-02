<template>
  <div>
    <ListTable v-bind="$data" />
    <UploadDialog :visible.sync="uploadDialogVisible" />
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
        columns: [
          'name', 'version', 'author', 'protocols',
          'type', 'comment', 'date_created', 'date_updated', 'actions'
        ],
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
            formatter: (row) => {
              return row.protocols.map(tag => <el-tag size='mini'>{tag}</el-tag>)
            }
          }
        }
      },
      headerActions: {
        onCreate: () => {
          this.uploadDialogVisible = true
        }
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
  }
}
</script>

<style scoped>

</style>
