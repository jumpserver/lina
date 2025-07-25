<template>
  <div class="auth-container">
    <IBox :title="$tc('AuthIntegration')" class="auth-box-wrapper auth-method-box">
      <el-row v-for="[type, items] in Object.entries(authItems)" :key="type" :gutter="20">
        <h3 class="auth-method-type">{{ typeMap[type] }}</h3>
        <AuthMethod
          v-for="item in items"
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
      typeMap: {
        common: this.$t('Common'),
        SSO: this.$t('SSO'),
        IdP: this.$t('IdP')
      },
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
      authItems = authItems.sort((a, b) => {
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1
        }
        return a.title.localeCompare(b.title)
      })

      this.authItems = authItems.reduce((acc, item) => {
        acc[item.type] = acc[item.type] || []
        acc[item.type].push(item)
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-method-box {
  ::v-deep {
    .el-card__body {
      padding-top: 10px;
      padding-left: 30px;
      padding-right: 30px;
    }
  }
}

h3.auth-method-type {
  margin-bottom: 8px;
  margin-top: 10px;
  padding-left: 10px;
}

.auth-container {
  width: 100%;

  .auth-box-wrapper {
    margin-bottom: 20px;
  }
}
</style>
