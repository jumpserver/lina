import store from '@/store'
import { Select2 } from '@/components/Form/FormFields'
import { ObjectLocalStorage } from '@/utils/common'

export const authLocalStorage = new ObjectLocalStorage('auth')

export function getOrgSelect2Meta() {
  return {
    component: Select2,
    el: {
      multiple: true,
      ajax: {
        url: '/api/v1/orgs/orgs/',
        transformOption: (item) => {
          return { label: item.name, value: item.id }
        }
      }
    },
    hidden: () => {
      return !store.getters.hasValidLicense
    }
  }
}

export const getAuthItem = (vm) => {
  const storageItems = authLocalStorage.get('authItems')

  if (storageItems) {
    return storageItems
  }

  const ldapHABackends = [
    {
      logo: require('@/assets/img/auth/ldap_logo.png'),
      title: vm.$t('LDAP HA'),
      authKey: 'AUTH_LDAP_HA',
      description: '',
      enabled: false
    }
  ]

  const extraBackends = [
    {
      logo: require('@/assets/img/auth/oidc_logo.png'),
      title: vm.$t('OIDC'),
      authKey: 'AUTH_OPENID',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/saml2_logo.png'),
      title: vm.$t('SAML2'),
      authKey: 'AUTH_SAML2',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/oauth2_logo.png'),
      title: vm.$t('OAuth2'),
      authKey: 'AUTH_OAUTH2',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/wecom_logo.png'),
      title: vm.$t('WeCom'),
      authKey: 'AUTH_WECOM',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/dingtalk_logo.webp'),
      title: vm.$t('DingTalk'),
      authKey: 'AUTH_DINGTALK',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/feishu_logo.png'),
      title: vm.$t('FeiShu'),
      authKey: 'AUTH_FEISHU',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/lark_logo.png'),
      title: vm.$t('Lark'),
      authKey: 'AUTH_LARK',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/slack_logo.png'),
      title: vm.$t('Slack'),
      authKey: 'AUTH_SLACK',
      description: '',
      enabled: false
    },
    {
      logo: require('@/assets/img/auth/radius_logo.png'),
      title: vm.$t('Radius'),
      authKey: 'AUTH_RADIUS',
      description: '',
      enabled: false
    }
  ]

  const authItems = [
    {
      logo: require('@/assets/img/auth/ldap_logo.png'),
      title: vm.$t('Ldap'),
      authKey: 'AUTH_LDAP',
      description: '',
      enabled: true
    },
    {
      logo: require('@/assets/img/auth/cas_logo.png'),
      title: vm.$t('CAS'),
      authKey: 'AUTH_CAS',
      description: '',
      enabled: true
    },
    {
      logo: require('@/assets/img/auth/passkey_logo.png'),
      title: vm.$t('Passkey'),
      authKey: 'AUTH_PASSKEY',
      description: '',
      enabled: true
    }
  ]

  if (store.getters.hasValidLicense) {
    // 把 AUTH_LDAP_HA 加到 authItems 中的 AUTH_LDAP 后面
    const ldapIndex = authItems.findIndex(item => item.authKey === 'AUTH_LDAP')

    if (ldapIndex !== -1) {
      authItems.splice(ldapIndex + 1, 0, ...ldapHABackends)
    }

    authItems.push(...extraBackends)
  }

  authLocalStorage.set('authItems', authItems)

  return authItems
}

export const setAuthItem = (value, authKey) => {
  const authItems = authLocalStorage.get('authItems')
  const authItem = authItems.find(item => item.authKey === authKey)

  if (authItem) {
    authItem.enabled = value
    authLocalStorage.set('authItems', authItems)
  }
}

