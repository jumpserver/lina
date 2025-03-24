import i18n from '@/i18n/i18n'
import CronTab from '@/components/Form/FormFields/CronTab/index.vue'
import InputWithUnit from '@/components/Form/FormFields/InputWithUnit.vue'
import store from '@/store'

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

export const crontab = {
  type: 'cronTab',
  component: CronTab,
  label: i18n.t('Crontab'),
  hidden: (formValue) => {
    return formValue.is_periodic === false
  },
  helpText: i18n.t('CrontabHelpText'),
  helpTip: i18n.t('CrontabHelpTip'),
  on: {
    change: (val, updateForm) => {
      updateForm({
        interval: ''
      })
    }
  }
}

const validatorInterval = (rule, value, callback) => {
  if (value === '') {
    return callback()
  }
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

export const interval = {
  label: i18n.t('Interval'),
  hidden: (formValue) => {
    return formValue.is_periodic === false
  },
  component: InputWithUnit,
  el: {
    unit: 'hour'
  },
  rules: [
    { validator: validatorInterval }
  ],
  on: {
    input: (val, updateForm) => {
      console.log('interval input', val)
      updateForm({
        crontab: ''
      })
    }
  }
}

export const is_periodic = {
  type: 'checkbox',
  hidden: (formValue) => {
    return !store.getters.hasValidLicense
  }
}

export const taskStatusFormatterMeta = {}

export const periodicMeta = {
  is_periodic,
  interval,
  crontab
}
