<template>
  <Dialog
    v-bind="$attrs"
    :destroy-on-close="true"
    :loading-status="testLdapLoginStatus"
    :show-cancel="false"
    :title="$tc('TestLdapLoginTitle')"
    @confirm="testUserLoginClick()"
  >
    <el-form :model="userLoginForm" label-position="right" label-width="17%">
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
import { requestLdap } from './request'

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
    async testUserLoginClick() {
      if (!this.$hasPerm('settings.change_auth')) {
        this.$message.error(this.$t('BadRoleErrorMsg'))
        return
      }
      this.testLdapLoginStatus = true
      try {
        const data = await requestLdap(this.category, {
          msg_type: 'testing_login',
          ...this.userLoginForm
        })
        this.$message.success(data.msg)
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.testLdapLoginStatus = false
      }
    }
  }
}
</script>

<style scoped></style>
