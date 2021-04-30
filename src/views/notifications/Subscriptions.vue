<template>
  <div>
    <el-table
      :data="tableData"
      row-key="msgId"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :span-method="spanMethod"
    >
      <el-table-column :label="'Message name'" width="230">
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="header in receiveBackends" :key="header.id" :label="header.name_display" width="120">
        <template #default="scope">
          <el-checkbox v-if="!scope.row.children" v-model="scope.row[header.name]" @change="onReceiveBackendChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column :label="'Receivers'" width="230" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="!scope.row.children">{{ scope.row.receivers.join(', ') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'Operate'" width="230">
        <template #default="scope">
          <el-button v-if="!scope.row.children" @click="onOpenDialog(scope.row)">修改消息接收人</el-button>
        </template>
      </el-table-column>
    </el-table>

    <select-dialog
      ref="myDialog"
      :visible.sync="dialogVisible"
      title="修改消息接受人"
      :init-selected-users="dialogSelectedUserIds"
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
      dialogVisible: false,
      dialogSelectedUserIds: [],
      currentEditObj: {},
      subscriptions: {},
      receiveBackends: [],
      tableData: [],
      msgIdEditObjMapper: {},

      idBackendMapper: {}
    }
  },
  mounted() {
    this.$axios.get('/api/v1/notifications/backends/').then(res => {
      this.initBackend(res)
      return this.$axios.get('/api/v1/notifications/subscriptions/')
    }).then(res => {
      this.initSubscription(res)
      return this.$axios.get('/api/v1/notifications/messages/')
    }).then(res => {
      this.initMessage(res)
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    getCheckedBackendIds(editObj) {
      const backendIds = []
      this.receiveBackends.forEach(backend => {
        if (editObj[backend.name]) {
          backendIds.push(backend.id)
        }
      })
      return backendIds
    },
    onReceiveBackendChange(editObj) {
      const backendIds = this.getCheckedBackendIds(editObj)

      if (!editObj.subscriptionId) {
        this.createSubscription(editObj, [])
      } else {
        this.$axios.patch(
          `/api/v1/notifications/subscriptions/${editObj.subscriptionId}/`,
          { receive_backends: backendIds }).catch(err => {
          console.log(err)
        })
      }
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if ('children' in row) {
        if (columnIndex === 0) {
          return [1, 4]
        }
      }
    },
    onDialogSelectSubmit(userIds) {
      console.log(`onDialogSelectSubmit ${userIds}`)
      this.dialogVisible = false
      const id = this.currentEditObj.subscriptionId
      if (!id) {
        this.createSubscription(this.currentEditObj, userIds)
      } else {
        this.$axios.patch(`/api/v1/notifications/subscriptions/${id}/`, { users: userIds }).then(res => {
          if (res.messages.length > 0) {
            const msgId = res.messages[0]
            const editObj = this.msgIdEditObjMapper[msgId]
            editObj.users = res.users
            editObj.receivers = res.receivers
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
    onOpenDialog(editObj) {
      this.currentEditObj = editObj
      this.dialogSelectedUserIds = editObj.users
      this.dialogVisible = true
    },
    createSubscription(editObj, userIds) {
      const backendIds = this.getCheckedBackendIds(editObj)
      const data = {
        users: userIds,
        receive_backends: backendIds,
        messages: [editObj.msgId]
      }
      this.$axios.post(`/api/v1/notifications/subscriptions/`, data).then(res => {
        if (res.messages.length > 0) {
          const msgId = res.messages[0]
          const editObj = this.msgIdEditObjMapper[msgId]
          editObj.users = res.users
          editObj.subscriptionId = res.id
        }
      }).catch(err => {
        console.log(err)
      })
    },
    initBackend(backends) {
      this.receiveBackends = backends

      this.receiveBackends.forEach(backend => {
        this.idBackendMapper[backend.id] = backend.name
      })
    },
    initSubscription(subscriptions) {
      this.subscriptions = subscriptions

      subscriptions.forEach(subscription => {
        if (subscription.messages.length > 0) {
          const msgId = subscription.messages[0]
          const backendSelect = {}

          subscription.receive_backends.forEach(backendId => {
            backendSelect[this.idBackendMapper[backendId]] = true
          })

          this.subscriptions[msgId] = {
            users: subscription.users,
            subscriptionId: subscription.id,
            receivers: subscription.receivers,
            ...backendSelect
          }
        }
      })
    },
    getBackendDefaultChecked() {
      const backendDefaultSelect = {}
      this.receiveBackends.forEach(backend => {
        backendDefaultSelect[backend.name] = false
      })
    },
    initMessage(messages) {
      const editObjs = []
      const appMessagesMapper = {}

      const backendDefaultChecked = this.getBackendDefaultChecked()

      messages.forEach(msg => {
        if (!Object.hasOwnProperty(appMessagesMapper, msg.app)) {
          const children = []
          editObjs.push({
            msgId: msg.app,
            value: msg.app_label,
            users: [],
            receivers: '',
            children,
            ...backendDefaultChecked
          })
          appMessagesMapper[msg.app] = children
        }
        const children = appMessagesMapper[msg.app]
        const editObj = {
          msgId: msg.id,
          value: msg.message_label,
          users: [],
          subscriptionId: null,
          ...backendDefaultChecked,
          ...this.subscriptions[msg.id]
        }
        children.push(editObj)
        this.msgIdEditObjMapper[msg.id] = editObj
      })
      this.tableData = editObjs
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
