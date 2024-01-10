import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'labels',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('Labels'),
      app: 'labels'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/labels/LabelList.vue'),
        name: 'LabelList',
        meta: { title: i18n.t('LabelList') }
      },
      {
        path: 'create',
        name: 'LabelCreate',
        component: () => import('@/views/labels/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('LabelCreate') }
      },
      {
        path: ':id/update',
        name: 'LabelUpdate',
        component: () => import('@/views/labels/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('LabelUpdate') }
      }
    ]
  }
]
