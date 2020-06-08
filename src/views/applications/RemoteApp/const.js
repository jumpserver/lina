import i18n from '@/i18n/i18n'

export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'

export const ALL_TYPES = [CHROME, MYSQL_WORKBENCH, VMWARE_CLIENT, CUSTOM]

function genTypeFieldsConfig(fields) {
  const config = []
  fields.forEach((item, index, array) => {
    config.push({
      id: item, el: {}, attrs: {}, type: 'input', prop: item,
      label: i18n.t('applications.' + item)
    })
  })
  return config
}

export const REMOTE_APP_TYPE_FIELDS_MAP = {}
REMOTE_APP_TYPE_FIELDS_MAP[CHROME] = genTypeFieldsConfig([
  'chrome_target', 'chrome_username', 'chrome_password'
])
REMOTE_APP_TYPE_FIELDS_MAP[MYSQL_WORKBENCH] = genTypeFieldsConfig([
  'mysql_workbench_ip', 'mysql_workbench_name', 'mysql_workbench_username', 'mysql_workbench_password'
])
REMOTE_APP_TYPE_FIELDS_MAP[VMWARE_CLIENT] = genTypeFieldsConfig([
  'vmware_target', 'vmware_username', 'vmware_password'
])
REMOTE_APP_TYPE_FIELDS_MAP[CUSTOM] = genTypeFieldsConfig([
  'custom_cmdline', 'custom_target', 'custom_username', 'custom_password'
])

export const REMOTE_APP_PATH_DEFAULT_MAP = {}
REMOTE_APP_PATH_DEFAULT_MAP[CHROME] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
REMOTE_APP_PATH_DEFAULT_MAP[MYSQL_WORKBENCH] = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\MySQLWorkbench.exe'
REMOTE_APP_PATH_DEFAULT_MAP[VMWARE_CLIENT] = 'C:\\Program Files (x86)\\VMware\\Infrastructure\\Virtual Infrastructure Client\\Launcher\\VpxClient.exe'

export const REMOTE_APP_TYPE_META_MAP = {}

for (const value of ALL_TYPES) {
  REMOTE_APP_TYPE_META_MAP[value] = {
    name: value,
    title: i18n.t('applications.' + value)
  }
}

