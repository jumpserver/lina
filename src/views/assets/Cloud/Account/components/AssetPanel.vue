<template>
  <div>
    <el-alert
      :closable="false"
      :center="false"
      style="margin-bottom: 6px"
    >
      <el-link :type="linkType" :icon="linkIcon" :underline="false"> {{ tip }} </el-link>
    </el-alert>
    <ImportTable
      ref="importTable"
      v-bind="settings"
      @cancel="closeDialog"
      @finish="closeDialog"
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
        importOption: 'create',
        showButtons: true,
        canEdit: false,
        config: {
          hasSelection: true,
          persistSelection: false,
          hasPagination: false,
          tableAttrs: {
            maxHeight: '200px'
          }
        },
        jsonData: {
          title: [
            [this.$tc('Name'), 'name'],
            [this.$tc('Address'), 'address'],
            [this.$tc('Platform'), 'platform'],
            [this.$tc('Node'), 'node'],
            [this.$tc('Protocol'), 'protocols'],
            [this.$tc('Region'), 'region_id']
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
      if (this.ws) { return }
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/xpack/cloud/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
      this.ws.onopen = (e) => {
        this.ws.send(JSON.stringify({
          action: 'sync_task', account_id: this.object.id
        }))
      }
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log('data: ', data)
        if (data.action === 'sync_region') {
          this.addRegion(data.region_id)
        } else if (data.action === 'import') {
          data['@status'] = 'pending'
          this.$refs.importTable.addTableItem(data)
        } else if (data.action === 'imported') {
          this.importAssets[data.asset_id]['@status'] = 'ok'
        } else if (data.action === 'finished') {
          this.linkType = 'success'
          this.linkIcon = 'el-icon-success'
          this.tip = `${this.$t('SyncSuccessMsg')}: ${this.alreadySync.join(', ')}`
        } else {
          this.$message.error(data.msg)
        }
      }
    },
    addRegion(region) {
      if (!this.alreadySync.includes(region)) {
        this.alreadySync.push(region)
        this.tip = `${this.$t('SyncRegion')}: ${this.alreadySync.at(-1)}`
      }
    },
    closeDialog() {
      if (this.ws) {
        this.ws.close()
      }
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
