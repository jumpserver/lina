import store from '@/store'
import { Select2 } from '@/components/Form/FormFields'
import i18n from '@/i18n/i18n'
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

export function getAuthItems() {
  const xpackBackends = [
    {
      name: 'LdapHA',
      logo: require('@/assets/img/auth/ldap_logo.png'),
      title: i18n.t('LDAP HA'),
      authKey: 'AUTH_LDAP_HA',
      description: ''
    },
    {
      name: 'OIDC',
      title: i18n.t('OIDC'),
      logo: require('@/assets/img/auth/oidc_logo.png'),
      authKey: 'AUTH_OPENID',
      description: ''
    },
    {
      name: 'SAML2',
      logo: require('@/assets/img/auth/saml2_logo.png'),
      title: i18n.t('SAML2'),
      authKey: 'AUTH_SAML2',
      description: ''
    },
    {
      name: 'OAUTH2',
      logo: require('@/assets/img/auth/oauth2_logo.png'),
      title: i18n.t('OAuth2'),
      authKey: 'AUTH_OAUTH2',
      description: ''
    },
    {
      name: 'WeCom',
      logo: require('@/assets/img/auth/wecom_logo.png'),
      title: i18n.t('WeCom'),
      authKey: 'AUTH_WECOM',
      description: ''
    },
    {
      name: 'DingTalk',
      logo: require('@/assets/img/auth/dingtalk_logo.webp'),
      title: i18n.t('DingTalk'),
      authKey: 'AUTH_DINGTALK',
      description: ''
    },
    {
      name: 'FeiShu',
      logo: require('@/assets/img/auth/feishu_logo.png'),
      title: i18n.t('FeiShu'),
      authKey: 'AUTH_FEISHU',
      description: ''
    },
    {
      name: 'Lark',
      logo: require('@/assets/img/auth/lark_logo.png'),
      title: i18n.t('Lark'),
      authKey: 'AUTH_LARK',
      description: ''
    },
    {
      name: 'Slack',
      logo: require('@/assets/img/auth/slack_logo.png'),
      title: i18n.t('Slack'),
      authKey: 'AUTH_SLACK',
      description: ''
    },
    {
      name: 'Radius',
      logo: require('@/assets/img/auth/radius_logo.png'),
      title: i18n.t('Radius'),
      authKey: 'AUTH_RADIUS',
      description: ''
    }
  ]

  const authItems = [
    {
      name: 'LDAP',
      logo: require('@/assets/img/auth/ldap_logo.png'),
      title: i18n.t('Ldap'),
      authKey: 'AUTH_LDAP',
      description: ''
    },
    {
      name: 'CAS',
      logo: require('@/assets/img/auth/cas_logo.png'),
      title: i18n.t('CAS'),
      authKey: 'AUTH_CAS',
      description: ''
    },
    {
      name: 'Passkey',
      logo: require('@/assets/img/auth/passkey_logo.png'),
      title: i18n.t('Passkey'),
      authKey: 'AUTH_PASSKEY',
      description: ''
    }
  ]

  if (store.getters.hasValidLicense) {
    // 把 AUTH_LDAP_HA 加到 authItems 中的 AUTH_LDAP 后面
    authItems.push(...xpackBackends)
  }
  return authItems
}

