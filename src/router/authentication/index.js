import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default {
  path: '/authentication/',
  name: 'authentication',
  component: empty,
  redirect: '/authentication/login',
  meta: {
    permissions: [],
    view: 'authentication'
  },
  children: [
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
      name: 'ForgetPassword',
      meta: {
        title: i18n.t('route.ForgetPassword'),
        permissions: []
      }
    },
    {
      path: '/authentication/forget-password/auth-step/',
      component: () => import('@/views/authentication/ForgetPassword/AuthStep'),
      name: 'ForgetPassword',
      meta: {
        title: i18n.t('route.ForgetPassword'),
        permissions: []
      }
    }
  ]
}
