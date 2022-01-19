import i18n from '@/i18n/i18n'
import { CronTab } from '@/components'

var validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('xpack.ChangeAuthPlan.validatorMessage.EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

function getFields() {
  const recipients = {
    label: i18n.t('xpack.ChangeAuthPlan.Addressee'),
    helpText: i18n.t('xpack.ChangeAuthPlan.OnlyMailSend'),
    el: {
      value: [],
      ajax: {
        url: '/api/v1/users/users/?fields_size=mini',
        transformOption: (item) => {
          return { label: item.name + '(' + item.username + ')', value: item.id }
        }
      }
    }
  }

  const is_periodic = {
    type: 'switch'
  }

  const crontab = {
    type: 'cronTab',
    component: CronTab,
    label: i18n.t('xpack.RegularlyPerform'),
    hidden: (formValue) => {
      return formValue.is_periodic === false
    },
    helpText: i18n.t('xpack.HelpText.CrontabOfCreateUpdatePage')
  }

  const interval = {
    label: i18n.t('xpack.CyclePerform'),
    hidden: (formValue) => {
      return formValue.is_periodic === false
    },
    helpText: i18n.t('xpack.HelpText.IntervalOfCreateUpdatePage'),
    rules: [
      { validator: validatorInterval }
    ]
  }

  return {
    is_periodic: is_periodic,
    crontab: crontab,
    interval: interval,
    recipients: recipients
  }
}

export default getFields
