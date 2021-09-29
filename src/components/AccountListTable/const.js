import { toSafeLocalDateStr } from '@/utils/common'
import ChoicesFormatter from '@/components/TableFormatters/ChoicesFormatter'
import i18n from '@/i18n/i18n'

export const connectivityMeta = {
  label: i18n.t('assets.Reachable'),
  formatter: ChoicesFormatter,
  formatterArgs: {
    iconChoices: {
      ok: 'fa-check',
      failed: 'fa-times',
      unknown: 'fa-circle-o'
    },
    classChoices: {
      ok: 'text-primary',
      failed: 'text-danger',
      unknown: 'text-warning'
    },
    hasTips: true,
    getTips: ({ row, cellValue }) => {
      const mapper = {
        'ok': i18n.t('assets.Reachable'),
        'failed': i18n.t('assets.Unreachable'),
        'unknown': i18n.t('assets.Unknown')
      }
      let tips = mapper[cellValue]
      if (row['date_verified']) {
        const datetime = toSafeLocalDateStr(row['date_verified'])
        tips += '<br> ' + datetime
      }
      return tips
    }
  },
  width: '90px',
  align: 'center'
}
