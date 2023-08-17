<template>
  <Dialog
    :destroy-on-close="true"
    :loading-status="testLdapLoginStatus"
    :show-cancel="false"
    :title="$tc('setting.testLdapLoginTitle') "
    v-bind="$attrs"
    @confirm="testUserLoginClick()"
    v-on="$listeners"
  >
    <el-form
      :model="userLoginForm"
      label-position="right"
      label-width="17%"
    >
      <el-form-item :label="$tc('setting.username')">
        <el-input
          v-model="userLoginForm.username"
          :placeholder="$tc('setting.usernamePlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item :label="$tc('setting.password')">
        <el-input
          v-model="userLoginForm.password"
          :placeholder="$tc('setting.passwordPlaceholder')"
          autocomplete="off"
          type="password"
        />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { testLdapUserLogin } from '@/api/settings'

export default {
  name: 'TestLoginDialog',
  components: {
    Dialog
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
      testLdapUserLogin(this.userLoginForm).then(res => {
        this.$message.success(res)
      }).catch(err => {
        const response = err.response
        this.$message.error(response.data)
        // eslint-disable-next-line no-return-assign
      }).finally(() => this.testLdapLoginStatus = false)
    }
  }
}
</script>

<style scoped>

</style>
