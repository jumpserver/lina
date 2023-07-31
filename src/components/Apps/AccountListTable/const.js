import i18n from '@/i18n/i18n'
import { ChoicesFormatter } from '@/components/Table/TableFormatters'

export const connectivityMeta = {
  label: i18n.t('assets.Connectivity'),
  formatter: ChoicesFormatter,
  formatterArgs: {
    faChoices: {
      '-': '',
      ok: 'fa-check-circle',
      err: 'fa-times-circle'
    },
    classChoices: {
      ok: 'text-primary',
      err: 'text-danger'
    },
    getText({ cellValue }) {
      if (cellValue?.value === '-' || cellValue?.value === 'unknown') {
        return '-'
      } else {
        return cellValue?.label
      }
    }
  },
  width: '100px'
}
