<template>
  <div class="auth-container">
    <IBox :title="$tc('AuthIntegration')" class="auth-box-wrapper">
      <el-row :gutter="20">
        <AuthMethod
          v-for="item in authItems"
          :key="item.title"
          v-bind="item"
        />
      </el-row>
    </IBox>
    <IBox :title="$tc('BasicSettings')" class="auth-box-wrapper">
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </div>
</template>

<script>
import AuthMethod from './components/AuthMethod.vue'
import IBox from '@/components/Common/IBox'
import { getAuthItems } from './const'
import { GenericCreateUpdateForm } from '@/layout/components'
import { mapState } from 'vuex'

export default {
  components: {
    IBox,
    AuthMethod,
    GenericCreateUpdateForm
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
  computed: {
    ...mapState({
      authMethodsSetting: state => state.settings.authMethods
    })
  },
  async mounted() {
    await this.$store.dispatch('settings/getAuthMethods')
    await this.initAuthItems()
  },
  methods: {
    async initAuthItems() {
      let authItems = await getAuthItems(this)
      authItems = authItems.map(item => {
        return {
          ...item,
          enabled: this.authMethodsSetting[item.authKey]
        }
      })
      this.authItems = authItems.sort((a, b) => {
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1
        }
        return a.title.localeCompare(b.title)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.auth-container {
  width: 100%;

  .auth-box-wrapper {
    margin-bottom: 20px;
  }
}
</style>
