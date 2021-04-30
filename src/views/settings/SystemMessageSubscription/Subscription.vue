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
        `/api/v1/notifications/system/subscriptions/${sub.id}/`,
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
        `/api/v1/notifications/system/subscriptions/${this.currentEditSub.id}/`,
        { users: userIds }
      ).then(newSub => {
        const msgType = this.idMessageTypeMapper[newSub.id]
        msgType.users = newSub.users
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
      const subscriptions = await this.$axios.get('/api/v1/notifications/system/subscriptions/')

      // 根据 app 分组
      const appMessageTypesMapper = {}
      subscriptions.forEach(sub => {
        if (!(sub.message_category in appMessageTypesMapper)) {
          appMessageTypesMapper[sub.message_category] = {
            id: sub.message_category,
            value: sub.message_category_label,
            children: [sub]
          }
        } else {
          appMessageTypesMapper[sub.message_category].children.push(sub)
        }
      })

      // sub 改成需要的数据结构
      for (const app of Object.values(appMessageTypesMapper)) {
        app.children = app.children.map(sub => {
          const backendsChecked = {}
          this.receiveBackends.forEach(backend => {
            backendsChecked[backend.name] = sub.receive_backends.indexOf(backend.name) > -1
          })
          const subObj = {
            id: sub.id,
            value: sub.message_label,
            receivers: sub.receivers,
            receive_backends: backendsChecked
          }
          this.idMessageTypeMapper[sub.id] = subObj
          return subObj
        })
      }
      this.tableData = Object.values(appMessageTypesMapper)
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
