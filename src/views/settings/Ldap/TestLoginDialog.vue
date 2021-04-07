<template>
  <Dialog
    v-bind="$attrs"
    :title="$t('setting.testLdapLoginTitle') "
    :destroy-on-close="true"
    :loading-status="testLdapLoginStatus"
    :show-cancel="false"
    v-on="$listeners"
    @confirm="testUserLoginClick()"
  >
    <el-form
      :model="userLoginForm"
      label-position="right"
      label-width="17%"
    >
      <el-form-item :label="$t('setting.username')">
        <el-input
          v-model="userLoginForm.username"
          :placeholder="$t('setting.usernamePlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item :label="$t('setting.password')">
        <el-input
          v-model="userLoginForm.password"
          type="password"
          :placeholder="$t('setting.passwordPlaceholder')"
          autocomplete="off"
        />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
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
