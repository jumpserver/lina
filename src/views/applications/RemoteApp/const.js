import i18n from '@/i18n/i18n'

export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'

export const ALL_TYPES = [CHROME, MYSQL_WORKBENCH, VMWARE_CLIENT, CUSTOM]

function gen_type_fields_config(fields) {
  const config = {}
  fields.forEach((item, index, array) => {
    config[item] = {
      prop: item,
      label: i18n.t('applications.' + item)
    }
  })
  return config
}

export const REMOTE_APP_TYPE_FIELDS_MAP = {}

REMOTE_APP_TYPE_FIELDS_MAP[CHROME] = gen_type_fields_config([
  'chrome_target', 'chrome_username', 'chrome_password'
])
REMOTE_APP_TYPE_FIELDS_MAP[MYSQL_WORKBENCH] = gen_type_fields_config([
  'mysql_workbench_ip', 'mysql_workbench_name', 'mysql_workbench_username', 'mysql_workbench_password'
])
REMOTE_APP_TYPE_FIELDS_MAP[VMWARE_CLIENT] = gen_type_fields_config([
  'vmware_target', 'vmware_username', 'vmware_password'
])
REMOTE_APP_TYPE_FIELDS_MAP[CUSTOM] = gen_type_fields_config([
  'custom_cmdline', 'custom_target', 'custom_username', 'custom_password'
])

export const REMOTE_APP_TYPE_META_MAP = {}

for (const value of ALL_TYPES) {
  REMOTE_APP_TYPE_META_MAP[value] = {
    name: value,
    title: i18n.t('applications.' + value)
  }
}
