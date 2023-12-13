import i18n from '@/i18n/i18n'

export const strMatchValues = ['exact', 'not', 'in', 'contains', 'startswith', 'endswith', 'regex']
export const typeMatchMapper = {
  str: strMatchValues,
  bool: ['exact', 'not'],
  m2m: ['m2m', 'm2m_all'],
  fk: ['m2m'],
  ip: [...strMatchValues, 'ip_in'],
  int: [...strMatchValues, 'gte', 'lte'],
  select: ['in']
}

export const attrMatchOptions = [
  { label: i18n.t('common.Equal'), value: 'exact' },
  { label: i18n.t('common.NotEqual'), value: 'not' },
  { label: i18n.t('common.MatchIn'), value: 'in' },
  { label: i18n.t('common.Contains'), value: 'contains' },
  { label: i18n.t('common.Exclude'), value: 'exclude' },
  { label: i18n.t('common.Startswith'), value: 'startswith' },
  { label: i18n.t('common.Endswith'), value: 'endswith' },
  { label: i18n.t('common.Regex'), value: 'regex' },
  { label: i18n.t('common.BelongTo'), value: 'm2m' },
  { label: i18n.t('common.BelongAll'), value: 'm2m_all' },
  { label: i18n.t('common.IPMatch'), value: 'ip_in' },
  { label: i18n.t('common.GreatEqualThan'), value: 'gte' },
  { label: i18n.t('common.LessEqualThan'), value: 'lte' }
]
