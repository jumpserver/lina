import { ChoicesFormatter } from '@/components/TableFormatters'
import { toSafeLocalDateStr } from '@/utils/common'
import i18n from '@/i18n/i18n'

export const connectivityMeta = {
  label: i18n.t('assets.Reachable'),
  formatter: ChoicesFormatter,
  formatterArgs: {
    iconChoices: {
      ok: 'fa-check text-primary',
      failed: 'fa-times text-danger',
      unknown: 'fa-circle text-warning'
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
