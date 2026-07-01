import store from '@/store'
import { Select2 } from '@/components/Form/FormFields'
import i18n from '@/i18n/i18n'
import { ObjectLocalStorage } from '@/utils/common/index'
import { getAssetUrl } from '@/utils/assets'

const t = i18n.global.t.bind(i18n.global)

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
      logo: getAssetUrl('img/auth/ldap_logo.png'),
      title: t('AD/LDAP HA'),
      authKey: 'AUTH_LDAP_HA',
      description: t('LdapHaSummary'),
      type: 'common'
    },
    {
      name: 'OIDC',
      title: t('OIDC'),
      logo: getAssetUrl('img/auth/oidc_logo.png'),
      authKey: 'AUTH_OPENID',
      type: 'SSO',
      description: t('OidcSummary')
    },
    {
      name: 'SAML2',
      logo: getAssetUrl('img/auth/saml2_logo.png'),
      title: t('SAML2'),
      authKey: 'AUTH_SAML2',
      type: 'SSO',
      description: t('Saml2Summary')
    },
    {
      name: 'OAuth2',
      logo: getAssetUrl('img/auth/oauth2_logo.png'),
      title: t('OAuth2'),
      authKey: 'AUTH_OAUTH2',
      type: 'SSO',
      description: t('OAuth2Summary')
    },
    {
      name: 'WeCom',
      logo: getAssetUrl('img/auth/wecom_logo.png'),
      title: t('WeCom'),
      authKey: 'AUTH_WECOM',
      type: 'IdP',
      description: t('WeComSummary')
    },
    {
      name: 'DingTalk',
      logo: getAssetUrl('img/auth/dingtalk_logo.webp'),
      title: t('DingTalk'),
      authKey: 'AUTH_DINGTALK',
      type: 'IdP',
      description: t('DingTalkSummary')
    },
    {
      name: 'FeiShu',
      logo: getAssetUrl('img/auth/feishu_logo.png'),
      title: t('FeiShu'),
      authKey: 'AUTH_FEISHU',
      type: 'IdP',
      description: t('FeiShuSummary')
    },
    {
      name: 'Lark',
      logo: getAssetUrl('img/auth/lark_logo.png'),
      title: t('Lark'),
      authKey: 'AUTH_LARK',
      type: 'IdP',
      description: t('LarkSummary')
    },
    {
      name: 'Slack',
      logo: getAssetUrl('img/auth/slack_logo.png'),
      title: t('Slack'),
      authKey: 'AUTH_SLACK',
      type: 'IdP',
      description: t('SlackSummary')
    },
    {
      name: 'Radius',
      logo: getAssetUrl('img/auth/radius_logo.png'),
      title: t('Radius'),
      authKey: 'AUTH_RADIUS',
      type: 'common',
      description: t('RadiusSummary')
    }
  ]

  const authItems = [
    {
      name: 'LDAP',
      logo: getAssetUrl('img/auth/ldap_logo.png'),
      title: t('AD/LDAP'),
      authKey: 'AUTH_LDAP',
      type: 'common',
      description: t('LdapSummary')
    },
    {
      name: 'CAS',
      logo: getAssetUrl('img/auth/cas_logo.png'),
      title: t('CAS'),
      authKey: 'AUTH_CAS',
      description: t('CasSummary'),
      type: 'SSO'
    },
    {
      name: 'Passkey',
      logo: getAssetUrl('img/auth/passkey_logo.png'),
      title: t('Passkey'),
      authKey: 'AUTH_PASSKEY',
      description: t('PasskeySummary'),
      type: 'common'
    }
  ]

  if (store.getters.hasValidLicense) {
    // 把 AUTH_LDAP_HA 加到 authItems 中的 AUTH_LDAP 后面
    authItems.push(...xpackBackends)
  }
  return authItems
}
