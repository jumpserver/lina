import { StatusFormatter } from '@/components/Table/TableFormatters'
import i18n from '@/i18n/i18n'

export const getStatusColumnMeta = (prop = '@status') => {
  return {
    status: {
      prop: prop,
      label: i18n.t('Status'),
      width: '80px',
      align: 'center',
      formatter: StatusFormatter,
      formatterArgs: {
        faChoices: {
          ok: 'fa-check text-primary',
          error: 'fa-times text-danger',
          pending: 'fa-clock-o'
        },
        getChoicesKey: (val) => {
          if (val === 'ok' || val === 'pending') {
            return val
          }
          return 'error'
        },
        getTip: (val) => {
          if (val === 'ok') {
            return i18n.t('Success')
          } else if (val === 'pending') {
            return i18n.t('Pending')
          } else if ((val && val.name === 'error') || val.error !== undefined) {
            return val.error
          }
          return ''
        },
        hasTips: true
      }
    }
  }
}

export default getStatusColumnMeta
