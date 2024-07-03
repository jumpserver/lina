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
  { label: i18n.t('Equal'), value: 'exact' },
  { label: i18n.t('NotEqual'), value: 'not' },
  { label: i18n.t('MatchIn'), value: 'in' },
  { label: i18n.t('Contains'), value: 'contains' },
  { label: i18n.t('Exclude'), value: 'exclude' },
  { label: i18n.t('Startswith'), value: 'startswith' },
  { label: i18n.t('Endswith'), value: 'endswith' },
  { label: i18n.t('Regex'), value: 'regex' },
  { label: i18n.t('BelongTo'), value: 'm2m' },
  { label: i18n.t('BelongAll'), value: 'm2m_all' },
  { label: i18n.t('IPMatch'), value: 'ip_in' },
  { label: i18n.t('GreatEqualThan'), value: 'gte' },
  { label: i18n.t('LessEqualThan'), value: 'lte' }
]
