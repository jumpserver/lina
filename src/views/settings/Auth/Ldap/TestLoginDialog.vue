<template>
  <Dialog
    :destroy-on-close="true"
    :loading-status="testLdapLoginStatus"
    :show-cancel="false"
    :title="$tc('TestLdapLoginTitle') "
    v-bind="$attrs"
    @confirm="testUserLoginClick()"
    v-on="$listeners"
  >
    <el-form
      :model="userLoginForm"
      label-position="right"
      label-width="17%"
    >
      <el-form-item :label="$tc('Username')">
        <el-input
          v-model="userLoginForm.username"
          :placeholder="$tc('UsernamePlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item :label="$tc('Password')">
        <el-input
          v-model="userLoginForm.password"
          :placeholder="$tc('PasswordPlaceholder')"
          autocomplete="off"
          type="password"
        />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'TestLoginDialog',
  components: {
    Dialog
  },
  props: {
    category: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      testLdapLoginStatus: false,
      userLoginForm: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    testUserLoginClick() {
      this.testLdapLoginStatus = true
      this.enableWS()
      this.ws.onopen = (e) => {
        this.ws.send(JSON.stringify({ msg_type: 'testing_login', ...this.userLoginForm }))
      }
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.ok) {
          this.$message.success(data.msg)
        } else {
          this.$message.error(data.msg)
        }
        this.testLdapLoginStatus = false
      }
    },
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = `/ws/ldap/?category=${this.category}`
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
    }
  }
}
</script>

<style scoped>

</style>
