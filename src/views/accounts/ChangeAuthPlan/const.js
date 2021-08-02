import i18n from '@/i18n/i18n'

export const ASSET = 'asset'
export const APPLICATION = 'application'
export const ALL_TYPES = [ASSET, APPLICATION]

export const CHANGE_PASSWORD_TYPE_META_MAP = {
  [ASSET]: {
    name: ASSET,
    title: i18n.t('xpack.ChangeAuthPlan.ChangeAssetPassword')
  },
  [APPLICATION]: {
    name: APPLICATION,
    title: i18n.t('xpack.ChangeAuthPlan.ChangeDatabasePassword')
  }
}
