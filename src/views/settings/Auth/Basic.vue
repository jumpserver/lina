<template>
  <div class="auth-container">
    <IBox class="auth-box-wrapper">
      <el-row :gutter="20">
        <AuthItem
          v-for="item in authItems"
          :key="item.title"
          v-bind="item"
          @update:enabled="updateAuthItemStatus"
        />
      </el-row>
    </IBox>

    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </div>
</template>

<script>
import AuthItem from './AuthItem.vue'
import IBox from '@/components/Common/IBox'
import { getAuthItem, setAuthItem } from './const'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm,
    AuthItem
  },
  data() {
    return {
      authItems: [],
      searchQuery: '',
      url: '/api/v1/settings/setting/?category=auth',
      fields: [
        'EMAIL_SUFFIX',
        'FORGOT_PASSWORD_URL',
        'LOGIN_REDIRECT_MSG_ENABLED'
      ],
      fieldsMeta: {
        FORGOT_PASSWORD_URL: {
          el: {
            placeholder: this.$t('ForgotPasswordURL')
          }
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  mounted() {
    this.authItems = getAuthItem(this)
  },
  methods: {
    updateAuthItemStatus(value, key) {
      setAuthItem(value, key)

      this.$nextTick(() => {
        this.authItems = getAuthItem(this)
        this.$emit('update:tabs', key, value)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.auth-container {
  width: 100%;

  .auth-box-wrapper {
    margin-bottom: 20px;
  }
}
</style>
