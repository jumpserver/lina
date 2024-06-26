import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'labels',
    component: empty,
    redirect: {
      name: 'LabelList'
    },
    meta: {
      title: i18n.t('Tags'),
      icon: 'tag',
      app: 'labels'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/labels/LabelList.vue'),
        name: 'LabelList',
        meta: { title: i18n.t('TagList') }
      },
      {
        path: 'create',
        name: 'LabelCreate',
        component: () => import('@/views/labels/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('TagCreate') }
      },
      {
        path: ':id/update',
        name: 'LabelUpdate',
        component: () => import('@/views/labels/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('TagUpdate') }
      }
    ]
  }
]
