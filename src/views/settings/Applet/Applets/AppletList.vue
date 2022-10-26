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
          'name', 'display_name', 'icon', 'type', 'actions'
        ],
        columnsMeta: {
          icon: {
            formatter: (row) => {
              return <img src={row.icon} width='32' height='32' alt='icon'></img>
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
