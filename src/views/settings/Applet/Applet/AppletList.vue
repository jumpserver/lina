<template>
  <div>
    <el-alert type="info">
      <span v-sanitize="$t('AppletHelpText')" />
    </el-alert>
    <CardTable v-bind="$data" ref="CardTable" />
    <UploadDialog v-model:visible="uploadDialogVisible" @upload-event="handleUpload" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CardTable from '@/components/Table/CardTable'
import UploadDialog from './UploadDialog'

export default {
  name: 'Applets',
  components: {
    CardTable,
    UploadDialog
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/terminal/applets/',
        deletePerm: 'terminal.delete_applet'
      },
      headerActions: {
        onCreate: () => {
          this.uploadDialogVisible = true
        },
        createTitle: this.$t('Upload'),
        hasCreate: this.$hasPerm('terminal.add_applet'),
        searchConfig: {
          getUrlQuery: false
        },
        extraActions: [
          {
            title: this.$t('Marketplace'),
            icon: 'el-icon-shopping-bag-1',
            callback: () => {
              window.open(this.publicSettings?.REMOTE_APP_STORE_URL)
            }
          }
        ],
        detailRoute: 'AppletDetail',
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasColumnSetting: false
      }
    }
  },
  mounted() {
    this.$store.dispatch('users/enterSettingOrg')
  },
  computed: {
    ...mapGetters({
      publicSettings: 'publicSettings'
    })
  },
  methods: {
    handleUpload(res) {
      this.$refs.CardTable.reloadTable()
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
