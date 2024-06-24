import { CronTab } from '@/components'
import i18n from '@/i18n/i18n'
import InputWithUnit from '@/components/Form/FormFields/InputWithUnit.vue'
import store from '@/store'

const validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

export const crontab = {
  type: 'cronTab',
  component: CronTab,
  label: i18n.t('Crontab'),
  hidden: (formValue) => {
    return formValue.is_periodic === false
  },
  helpText: i18n.t('CrontabHelpText'),
  helpTip: i18n.t('CrontabHelpTip')
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
  ]
}

export const is_periodic = {
  type: 'switch',
  hidden: (formValue) => {
    return !store.getters.hasValidLicense
  }
}

export default {
  crontab: crontab,
  interval: interval,
  is_periodic: is_periodic
}

