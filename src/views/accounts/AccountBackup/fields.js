import i18n from '@/i18n/i18n'
import { periodicMeta } from '@/components/const'
import { ResourceSelect } from '@/components/Form/FormFields'

function getAccountBackupFields() {
  const recipients_part_one = {
    type: 'resourceSelect',
    component: ResourceSelect,
    label: i18n.t('Recipient') + ' A',
    helpText: i18n.t('RecipientHelpText'),
    hidden: (formValue) => {
      return formValue.backup_type !== 'email'
    },
    el: {
      value: [],
      url: '/api/v1/users/users/?fields_size=mini',
      resourceName: i18n.t('Users')
    }
  }

  const recipients_part_two = {
    type: 'resourceSelect',
    component: ResourceSelect,
    label: i18n.t('Recipient') + ' B',
    helpText: i18n.t('RecipientHelpText'),
    hidden: (formValue) => {
      return !(formValue.backup_type === 'email' && formValue.is_password_divided_by_email)
    },
    el: {
      value: [],
      url: '/api/v1/users/users/?fields_size=mini',
      resourceName: i18n.t('Users')
    }
  }
  const obj_recipients_part_one = {
    type: 'resourceSelect',
    component: ResourceSelect,
    label: i18n.t('RecipientServer') + ' A',
    helpText: i18n.t('RecipientHelpText'),
    hidden: (formValue) => {
      return formValue.backup_type !== 'object_storage'
    },
    el: {
      value: [],
      url: '/api/v1/terminal/replay-storages/?type=sftp&fields_size=mini',
      resourceName: i18n.t('RecipientServer')
    }
  }

  const obj_recipients_part_two = {
    type: 'resourceSelect',
    component: ResourceSelect,
    label: i18n.t('RecipientServer') + ' B',
    helpText: i18n.t('RecipientHelpText'),
    hidden: (formValue) => {
      return !(
        formValue.backup_type === 'object_storage' && formValue.is_password_divided_by_obj_storage
      )
    },
    el: {
      value: [],
      url: '/api/v1/terminal/replay-storages/?type=sftp&fields_size=mini',
      resourceName: i18n.t('RecipientServer')
    }
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
    ...periodicMeta,
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
