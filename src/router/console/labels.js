import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { createViewSetRoutes } from '../viewset'

export default [
  {
    path: 'labels',
    component: empty,
    name: 'ConsoleLabels',
    redirect: {
      name: 'LabelList'
    },
    meta: {
      title: i18n.t('Tags'),
      icon: 'tag',
      app: 'labels'
    },
    children: createViewSetRoutes({
      name: 'Label',
      list: () => import('@/views/labels/LabelList.vue'),
      form: () => import('@/views/labels/LabelCreateUpdate.vue'),
      meta: {
        list: { title: i18n.t('TagList') },
        create: { title: i18n.t('TagCreate') },
        update: { title: i18n.t('TagUpdate') }
      }
    })
  }
]
