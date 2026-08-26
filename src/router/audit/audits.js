import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import store from '@/store'

export default [
  {
    path: 'login-logs',
    name: 'LoginLog',
    component: empty,
    redirect: {
      name: 'LoginLogList'
    },
    meta: {
      title: i18n.t('BaseLoginLog'),
      icon: 'login',
      permissions: ['audits.view_userloginlog']
    },
    children: [
      {
        path: '',
        name: 'LoginLogList',
        component: () => import('@/views/audits/LoginLog/LoginLogList'),
        meta: {
          title: i18n.t('LoginLog'),
          permissions: ['audits.view_userloginlog']
        }
      },
      {
        path: ':id',
        name: 'LoginLogDetail',
        component: () => import('@/views/audits/LoginLog/LoginLogDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('LoginLog'),
          permissions: ['audits.view_userloginlog']
        }
      }
    ]
  },
  {
    path: 'password-change-log',
    name: 'PasswordChangeLog',
    component: () => import('@/views/audits/PasswordChangeLogList'),
    meta: {
      title: i18n.t('UserPasswordChangeLog'),
      menuTitle: i18n.t('PasswordChangeLog'),
      icon: 'password',
      permissions: ['audits.view_passwordchangelog']
    }
  },
  {
    path: 'operate-logs',
    name: '',
    redirect: {
      name: 'OperateLogList'
    },
    component: empty,
    meta: {
      title: i18n.t('BaseOperateLog'),
      icon: 'operate-log',
      permissions: ['audits.view_operatelog']
    },
    children: [
      {
        path: '',
        name: 'OperateLogList',
        component: () => import('@/views/audits/OperateLog/OperateLogList'),
        meta: {
          title: i18n.t('OperateLog'),
          permissions: ['audits.view_operatelog']
        }
      },
      {
        path: ':id',
        name: 'OperateLogDetail',
        component: () => import('@/views/audits/OperateLog/OperateLogDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('OperateLog'),
          permissions: ['audits.view_operatelog']
        }
      }
    ]
  },
  {
    path: 'ai-conversations',
    name: 'ChatAIConversationAudit',
    component: () => import('@/views/audits/ChatAIConversationAudit/index.vue'),
    meta: {
      title: i18n.t('ChatAIConversationAudit'),
      icon: 'chat',
      permissions: [],
      hidden: () => {
        const settings = store.getters.publicSettings || {}
        const method = settings.CHAT_AI_METHOD || 'api'
        return (
          !store.getters.currentUserIsSuperAdmin ||
          settings.CHAT_AI_ENABLED !== true ||
          method !== 'api'
        )
      }
    }
  },
  {
    path: 'ai-conversations/:id',
    name: 'ChatAIConversationAuditDetail',
    component: () => import('@/views/audits/ChatAIConversationAudit/index.vue'),
    hidden: true,
    meta: {
      title: i18n.t('ChatAIConversationAudit'),
      activeMenu: '/audit/audits/ai-conversations',
      permissions: []
    }
  }
]
