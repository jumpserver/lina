<template>
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
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="header in receiveBackends" :key="header.id" :label="header.name_display" width="120">
        <template #default="scope">
          <el-checkbox v-if="!scope.row.children" v-model="scope.row.receive_backends[header.name]" @change="onCheckReceiveBackend(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('notifications.Receivers')" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="!scope.row.children">{{ scope.row.receivers.map(item => item.name).join(', ') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.Actions')" width="200">
        <template #default="scope">
          <el-button v-if="!scope.row.children" type="small" @click="onOpenDialog(scope.row)">{{ $t('notifications.ChangeReceiver') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <SelectDialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      title="修改消息接受人"
      :selected-users="dialogSelectedUsers"
      @submit="onDialogSelectSubmit"
      @cancel="dialogVisible=false"
    />
  </div>
</template>

<script>
import SelectDialog from './SelectDialog'
export default {
  components: { SelectDialog },
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
      for (const [name, checked] of Object.entries(sub.receive_backends)) {
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
      }).catch(err => {
        console.log(err)
      })
    },
    onOpenDialog(sub) {
      this.currentEditSub = sub
      this.dialogSelectedUsers = sub.receivers
      this.dialogVisible = true
    },
    async initBackends() {
      this.receiveBackends = await this.$axios.get('/api/v1/notifications/backends/')
    },
    async initSubscriptions() {
      const subscriptions = await this.$axios.get('/api/v1/notifications/system-msg-subscription/')

      const trans_subscriptions = []

      for (const category of subscriptions) {
        const children = []
        trans_subscriptions.push({
          id: category.category,
          value: category.category_label,
          children: children
        })

        for (const sub of category.children) {
          const backendsChecked = {}
          this.receiveBackends.forEach(backend => {
            backendsChecked[backend.name] = sub.receive_backends.indexOf(backend.name) > -1
          })

          const trans_sub = {
            id: sub.message_type,
            value: sub.message_type_label,
            receivers: sub.receivers,
            receive_backends: backendsChecked
          }
          children.push(trans_sub)

          this.idMessageTypeMapper[trans_sub.id] = trans_sub
        }
      }

      this.tableData = trans_subscriptions
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
