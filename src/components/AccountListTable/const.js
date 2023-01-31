import ChoicesFormatter from '@/components/TableFormatters/ChoicesFormatter'
import i18n from '@/i18n/i18n'

export const connectivityMeta = {
  label: i18n.t('assets.Reachable'),
  formatter: ChoicesFormatter,
  formatterArgs: {
    faChoices: {
      ok: 'fa-check-circle',
      failed: 'fa-times-circle',
      unknown: 'fa fa-question-circle'
    },
    classChoices: {
      ok: 'text-primary',
      failed: 'text-danger',
      unknown: 'fa fa-question-circle'
    },
    textChoices: {
      ok: 'Avail',
      failed: 'Failed',
      unknown: '-'
    }
  },
  width: '100px',
  align: 'center'
}
