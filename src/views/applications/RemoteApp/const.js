import i18n from '@/i18n/i18n'

export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'

export const ALL_TYPES = [CHROME, MYSQL_WORKBENCH, VMWARE_CLIENT, CUSTOM]

export const REMOTE_APP_TYPE_FIELDS_MAP = {
  [CHROME]: ['asset', 'path', 'chrome_target', 'chrome_username', 'chrome_password'],
  [MYSQL_WORKBENCH]: [
    'asset', 'path',
    'mysql_workbench_ip',
    'mysql_workbench_port',
    'mysql_workbench_name',
    'mysql_workbench_username',
    'mysql_workbench_password'
  ],
  [VMWARE_CLIENT]: [
    'asset', 'path',
    'vmware_target',
    'vmware_username',
    'vmware_password'
  ],
  [CUSTOM]: [
    'asset', 'path',
    'custom_cmdline',
    'custom_target',
    'custom_username',
    'custom_password'
  ]
}

export const REMOTE_APP_PATH_DEFAULT_MAP = {
  [CHROME]: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  [MYSQL_WORKBENCH]: 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\MySQLWorkbench.exe',
  [VMWARE_CLIENT]: 'C:\\Program Files (x86)\\VMware\\Infrastructure\\Virtual Infrastructure Client\\Launcher\\VpxClient.exe'
}

export const REMOTE_APP_TYPE_META_MAP = {
  [CHROME]: {
    name: CHROME,
    title: 'Chrome'
  },
  [MYSQL_WORKBENCH]: {
    name: MYSQL_WORKBENCH,
    title: 'MySQL Workbench'
  },
  [VMWARE_CLIENT]: {
    name: VMWARE_CLIENT,
    title: 'vSphere Client'
  },
  [CUSTOM]: {
    name: CUSTOM,
    title: i18n.t('applications.custom')
  }
}
