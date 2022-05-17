<template>
  <Page v-bind="$attrs">
    <div>
      <el-table
        :data="tableData"
        row-key="id"
        default-expand-all
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        :span-method="spanMethod"
        :stripe="true"
      >
        <el-table-column :label="$t('notifications.MessageType')" width="230">
          <template v-slot="scope">
            <span>{{ scope.row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column v-for="header in receiveBackends" :key="header.id" :label="getNameDisplay(header)" width="80">
          <template v-slot="scope">
            <span v-if="!scope.row.children">
              <el-checkbox
                v-if="header.name !== 'site_msg'"
                v-model="scope.row.receiveBackends[header.name]"
                @change="onCheckReceiveBackend(scope.row)"
              />
              <el-checkbox v-else :value="true" :disabled="true" />
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('notifications.Receivers')" show-overflow-tooltip>
          <template v-slot="scope">
            <span v-if="!scope.row.children">
              {{ scope.row.receivers.map(item => item.name).join(', ') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.Actions')" width="200">
          <template v-slot="scope">
            <el-button v-if="!scope.row.children" type="small" @click="onOpenDialog(scope.row)">
              {{ $t('notifications.ChangeReceiver') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <SelectDialog
        v-if="dialogVisible"
        :visible.sync="dialogVisible"
        :title="$t('notifications.ChangeReceiver')"
        :selected-users="dialogSelectedUsers"
        @submit="onDialogSelectSubmit"
        @cancel="dialogVisible=false"
      />
    </div>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import SelectDialog from './SelectDialog'
export default {
  components: {
    Page,
    SelectDialog
  },
  data() {
    return {
      currentEditSub: {},
      dialogVisible: false,
      dialogSelectedUsers: [],
      receiveBackends: [],
      tableData: [],
      idMessageTypeMapper: {},
      idBackendMapper: {}
    }
  },
  async mounted() {
    await this.initBackends()
    await this.initSubscriptions()
  },
  methods: {
    onCheckReceiveBackend(sub) {
      const backends = []
      for (const [name, checked] of Object.entries(sub.receiveBackends)) {
        if (checked) { backends.push(name) }
      }

      this.$axios.patch(
        `/api/v1/notifications/system-msg-subscription/${sub.id}/`,
        { receive_backends: backends }
      ).catch(err => {
        this.$log.error(err)
      })
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
    },
    onDialogSelectSubmit(userIds) {
      this.dialogVisible = false
      this.$axios.patch(
        `/api/v1/notifications/system-msg-subscription/${this.currentEditSub.id}/`,
        { users: userIds }
      ).then(newSub => {
        const msgType = this.idMessageTypeMapper[newSub.message_type]
        msgType.receivers = newSub.receivers
      }).catch(() => {
        // debug(err)
      })
    },
    getNameDisplay(header) {
      const displayName = header['name_display']
      if (displayName === 'Site message') {
        return 'Inbox'
      }
      return displayName
    },
    onOpenDialog(sub) {
      this.currentEditSub = sub
      this.dialogSelectedUsers = sub.receivers
      this.dialogVisible = true
    },
    async initBackends() {
      let backends = []
      backends = await this.$axios.get('/api/v1/notifications/backends/')
      this.receiveBackends = backends.filter(backend => {
        return backend.name // !== 'site_msg'
      })
    },
    async initSubscriptions() {
      const subscriptions = await this.$axios.get('/api/v1/notifications/system-msg-subscription/')
      const subCategory = []

      for (const category of subscriptions) {
        const subItems = []
        const item = {
          id: category['category'],
          value: category['category_label'],
          children: subItems
        }

        for (const item of category['children']) {
          const backendsChecked = {}
          this.receiveBackends.forEach(backend => {
            backendsChecked[backend.name] = item['receive_backends'].indexOf(backend.name) > -1
          })

          const subItem = {
            id: item['message_type'],
            value: item['message_type_label'],
            receivers: item.receivers,
            receiveBackends: backendsChecked
          }
          subItems.push(subItem)

          this.idMessageTypeMapper[subItem.id] = subItems
        }
        subCategory.push(item)
      }
      this.tableData = subCategory
    }
  }
}
</script>

<style scoped>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
