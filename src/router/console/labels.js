import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'labels',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.Labels')
    },
    children: [
      {
        path: '',
        component: () => import('@/views/labels/LabelList.vue'),
        name: 'LabelList',
        meta: { title: i18n.t('route.LabelList'), permissions: ['labels.view_label'] }
      },
      {
        path: 'create',
        name: 'LabelCreate',
        component: () => import('@/views/labels/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.LabelCreate') }
      },
      {
        path: ':id/update',
        name: 'LabelUpdate',
        component: () => import('@/views/labels/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.LabelUpdate') }
      }
    ]
  }
]
