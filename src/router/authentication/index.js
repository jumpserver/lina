import i18n from '@/i18n/i18n'

export default [
  {
    path: '/flash-message',
    name: 'FlashMessage',
    component: () => import('@/views/common/FlashMessage'),
    hidden: true
  },
  {
    path: '/mfa/setting',
    name: 'MFASetting',
    component: () => import('@/views/authentication/MFAFirstSet'),
    hidden: true,
    meta: {
      permissions: []
    }
  },
  {
    path: '/authentication/login',
    component: () => import('@/views/authentication/Login'),
    name: 'Login',
    meta: {
      title: i18n.t('route.Login'),
      permissions: []
    }
  },
  {
    path: '/authentication/forget-password',
    component: () => import('@/views/authentication/ForgetPassword'),
    name: 'ForgetPasswordPreviewing',
    meta: {
      title: i18n.t('route.ForgetPassword'),
      permissions: []
    }
  },
  {
    path: '/authentication/forget-password/auth-step/',
    component: () => import('@/views/authentication/ForgetPassword/AuthStep'),
    name: 'ForgetPassword-2',
    meta: {
      title: i18n.t('route.ForgetPassword'),
      permissions: []
    }
  },
  {
    path: '/authentication/password/reset/',
    component: () => import('@/views/authentication/ResetPassword'),
    name: 'ResetPassword',
    meta: {
      title: i18n.t('route.ResetPassword'),
      permissions: []
    }
  }
]
