import i18n from '@/i18n/i18n'
import { CronTab } from '@/components'

const validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('accounts.ChangeAuthPlan.validatorMessage.EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

function getAccountBackupFields() {
  const recipients_part_one = {
    label: i18n.t('accounts.AccountChangeSecret.Addressee') + ' A',
    helpText: i18n.t('accounts.AccountBackup.RecipientHelpText'),
    hidden: (formValue) => {
      return formValue.backup_type !== 'email'
    },
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

  const recipients_part_two = {
    label: i18n.t('accounts.AccountChangeSecret.Addressee') + ' B',
    helpText: i18n.t('accounts.AccountBackup.RecipientHelpText'),
    hidden: (formValue) => {
      return !(formValue.backup_type === 'email' && formValue.is_password_divided_by_email)
    },
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
  const obj_recipients_part_one = {
    label: i18n.t('accounts.AccountBackup.RecipientServer') + ' A',
    helpText: i18n.t('accounts.AccountBackup.RecipientHelpText'),
    hidden: (formValue) => {
      return formValue.backup_type !== 'object_storage'
    },
    el: {
      value: [],
      ajax: {
        url: '/api/v1/terminal/replay-storages/?type=sftp&fields_size=mini',
        transformOption: (item) => {
          return { label: item.name + '(' + item.meta.SFTP_HOST + ':' + item.meta.SFTP_ROOT_PATH + ')', value: item.id }
        }
      }
    }
  }

  const obj_recipients_part_two = {
    label: i18n.t('accounts.AccountBackup.RecipientServer') + ' B',
    helpText: i18n.t('accounts.AccountBackup.RecipientHelpText'),
    hidden: (formValue) => {
      return !(formValue.backup_type === 'object_storage' && formValue.is_password_divided_by_obj_storage)
    },
    el: {
      value: [],
      ajax: {
        url: '/api/v1/terminal/replay-storages/?type=sftp&fields_size=mini',
        transformOption: (item) => {
          return { label: item.name + '(' + item.meta.SFTP_HOST + ':' + item.meta.SFTP_ROOT_PATH + ')', value: item.id }
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
  const is_password_divided_by_email = {
    hidden: (formValue) => {
      return formValue.backup_type !== 'email'
    }
  }
  const is_password_divided_by_obj_storage = {
    hidden: (formValue) => {
      return formValue.backup_type !== 'object_storage'
    }
  }
  const zip_encrypt_password = {
    hidden: (formValue) => {
      return formValue.backup_type !== 'object_storage'
    }
  }
  return {
    is_periodic: is_periodic,
    crontab: crontab,
    interval: interval,
    is_password_divided_by_email: is_password_divided_by_email,
    is_password_divided_by_obj_storage: is_password_divided_by_obj_storage,
    recipients_part_one: recipients_part_one,
    recipients_part_two: recipients_part_two,
    obj_recipients_part_one: obj_recipients_part_one,
    obj_recipients_part_two: obj_recipients_part_two,
    zip_encrypt_password: zip_encrypt_password
  }
}

export default getAccountBackupFields
