import i18n from '@/i18n/i18n'

export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'

export const ALL_TYPES = [CHROME, MYSQL_WORKBENCH, VMWARE_CLIENT, CUSTOM]

export const REMOTE_APP_TYPE_FIELDS_MAP = {
  [CHROME]: [
    {
      id: 'chrome_target', el: {}, attrs: {}, type: 'input', prop: 'chrome_target',
      label: i18n.t('applications.chrome_target')
    },
    {
      id: 'chrome_username', el: {}, attrs: {}, type: 'input', prop: 'chrome_username',
      label: i18n.t('applications.chrome_username')
    },
    {
      id: 'chrome_password', el: {}, attrs: {}, type: 'input', prop: 'chrome_password',
      label: i18n.t('applications.chrome_password')
    }
  ],
  [MYSQL_WORKBENCH]: [
    {
      id: 'mysql_workbench_ip', el: {}, attrs: {}, type: 'input', prop: 'mysql_workbench_ip',
      label: i18n.t('applications.mysql_workbench_ip')
    },
    {
      id: 'mysql_workbench_name', el: {}, attrs: {}, type: 'input', prop: 'mysql_workbench_name',
      label: i18n.t('applications.mysql_workbench_name')
    },
    {
      id: 'mysql_workbench_username', el: {}, attrs: {}, type: 'input', prop: 'mysql_workbench_username',
      label: i18n.t('applications.mysql_workbench_username')
    },
    {
      id: 'mysql_workbench_password', el: {}, attrs: {}, type: 'input', prop: 'mysql_workbench_password',
      label: i18n.t('applications.mysql_workbench_password')
    }
  ],
  [VMWARE_CLIENT]: [
    {
      id: 'vmware_target', el: {}, attrs: {}, type: 'input', prop: 'vmware_target',
      label: i18n.t('applications.vmware_target')
    },
    {
      id: 'vmware_username', el: {}, attrs: {}, type: 'input', prop: 'vmware_username',
      label: i18n.t('applications.vmware_username')
    },
    {
      id: 'vmware_password', el: {}, attrs: {}, type: 'input', prop: 'vmware_password',
      label: i18n.t('applications.vmware_password')
    }
  ],
  [CUSTOM]: [
    {
      id: 'custom_cmdline', el: {}, attrs: {}, type: 'input', prop: 'custom_cmdline',
      label: i18n.t('applications.custom_cmdline')
    },
    {
      id: 'custom_target', el: {}, attrs: {}, type: 'input', prop: 'custom_target',
      label: i18n.t('applications.custom_target')
    },
    {
      id: 'custom_username', el: {}, attrs: {}, type: 'input', prop: 'custom_username',
      label: i18n.t('applications.custom_username')
    },
    {
      id: 'custom_password', el: {}, attrs: {}, type: 'input', prop: 'custom_password',
      label: i18n.t('applications.custom_password')
    }
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
