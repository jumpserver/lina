<template>
  <div class="asset-panel">
    <el-alert
      :center="false"
      :closable="true"
      style="margin-bottom: 6px"
    >
      <el-link :icon="linkIcon" :type="linkType" :underline="false"> {{ tip }}</el-link>
    </el-alert>
    <ImportTable
      ref="importTable"
      origin="cloudSync"
      v-bind="settings"
      @cancel="closeDialog"
      @finish="showResult"
    />
  </div>
</template>

<script>

import ImportTable from '@/components/Table/ListTable/TableAction/ImportTable'
import _isequal from 'lodash.isequal'

export default {
  name: 'AssetPanel',
  components: {
    ImportTable
  },
  props: {
    active: {
      type: Number,
      default: null
    },
    object: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    const vm = this
    return {
      ws: null,
      importAssets: {},
      tip: this.$tc('PrepareSyncTask'),
      linkType: 'primary',
      linkIcon: 'el-icon-loading',
      alreadySync: [],
      settings: {
        showCancel: !this.active,
        importOption: 'create',
        showButtons: true,
        disableImportBtn: false,
        canEdit: false,
        moreButtons: [
          {
            title: this.$t('Next'),
            type: 'primary',
            hidden: !this.active,
            callback: () => {
              this.$emit('update:active', 3)
            }
          }
        ],
        config: {
          url: '',
          hasSelection: true,
          persistSelection: false,
          hasPagination: false,
          tableAttrs: {
            height: '300px'
          }
        },
        jsonData: {
          title: [
            [this.$tc('Name'), 'name'],
            [this.$tc('Address'), 'address'],
            [this.$tc('Platform'), 'platform'],
            [this.$tc('Node'), 'node'],
            [this.$tc('Protocol'), 'protocols'],
            [this.$tc('Region'), 'region_name']
          ],
          data: []
        },
        performUploadObject: async function(item) {
          const data = { action: 'sync_import', asset_id: item.id }
          vm.ws.send(JSON.stringify(data))
          vm.importAssets[item.id] = item
        }
      }
    }
  },
  watch: {
    visible: {
      handler(v, oldV) {
        if (!v || _isequal(v, oldV)) return
        this.enableWS()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    enableWS() {
      if (this.ws) {
        return
      }
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/xpack/cloud/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
      this.ws.onopen = (e) => {
        this.settings.disableImportBtn = true
        this.ws.send(JSON.stringify({
          action: 'sync_task', account_id: this.object.id
        }))
      }
      this.ws.onerror = () => {
        this.$message.error(this.$tc('ConnectWebSocketError'))
      }
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.action === 'sync_region') {
          this.addRegion(data.id, data.name)
        } else if (data.action === 'import') {
          data['@status'] = 'pending'
          this.$refs.importTable.addTableItem(data)
        } else if (data.action === 'imported') {
          this.importAssets[data.asset_id]['@status'] = 'ok'
        } else if (data.action === 'finished') {
          this.linkType = 'success'
          this.linkIcon = 'el-icon-success'
          this.settings.disableImportBtn = false
          this.tip = `${this.$t('SyncSuccessMsg')}`
        } else {
          this.$message.error(data?.msg)
        }
      }
    },
    addRegion(regionId, regionName) {
      if (!this.alreadySync.includes(regionId)) {
        this.alreadySync.push(regionId)
        this.tip = `${this.$t('SyncRegion')}: ${regionName}`
      }
    },
    showResult() {
      if (this.ws) {
        this.ws.close()
      }
      this.$emit('update:active', 4)
    },
    closeDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.asset-panel {
  display: block;

}
</style>
