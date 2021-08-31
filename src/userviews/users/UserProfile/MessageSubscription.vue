<template>
  <el-card class="box-card">
    <el-form ref="form" v-model="data" label-width="80px">
      <el-form-item v-for="(item, i) of data" :key="i" :label="item.name_display">
        <el-switch v-model="item.flag" />
      </el-form-item>
      <el-form-item>
        <el-button size="small" @click="onReset">重置</el-button>
        <el-button size="small" type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import request from '@/utils/request'
export default {
  name: 'MessageSubscription',
  components: {

  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      url: '/api/v1/users/profile/public-key/',
      data: [],
      form: {
        delivery: false
      }
    }
  },
  mounted() {
    // eslint-disable-next-line no-unused-vars
    var temp = []
    request({
      url: `/api/v1/notifications/backends/`,
      method: 'get'
    }).then(data => {
      temp = data
    })
    request({
      url: `/api/v1/notifications/user-msg-subscription/${this.$store.state.users.profile.id}/`,
      method: 'get'
    }).then(data => {
      temp.forEach(item => {
        if (data.receive_backends.indexOf(item.name) !== -1) {
          item.flag = true
        } else {
          item.flag = false
        }
      })
      this.data = temp
    })
  },
  methods: {
    onSubmit() {
      // eslint-disable-next-line no-unused-vars
      var receive_backends = []
      this.data.forEach(item => {
        if (item.flag) {
          receive_backends.push(item.name)
        }
      })
      request({
        url: `/api/v1/notifications/user-msg-subscription/${this.$store.state.users.profile.id}/`,
        method: 'patch',
        data: { 'receive_backends': receive_backends }
      }).then(data => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      })
    },
    onReset() {
      this.data.forEach(item => {
        item.flag = false
      })
    }
  }
}
</script>

<style scoped>

</style>
