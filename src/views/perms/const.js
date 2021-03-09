import i18n from '@/i18n/i18n'
import store from '@/store'
export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'
export const REMOTEAPP_CATEGORY = 'remote_app'

function hasValidLicense() {
  if (store.getters.publicSettings.XPACK_ENABLED) {
    return store.getters.publicSettings.XPACK_LICENSE_IS_VALID
  }
  return false
}

export const REMOTE_APP = [
  {
    name: CHROME,
    title: i18n.t(`applications.applicationsType.${CHROME}`),
    type: 'primary',
    group: i18n.t('applications.RemoteApp'),
    has: hasValidLicense
  },
  {
    name: MYSQL_WORKBENCH,
    title: i18n.t(`applications.applicationsType.${MYSQL_WORKBENCH}`),
    type: 'primary',
    has: hasValidLicense
  },
  {
    name: VMWARE_CLIENT,
    title: i18n.t(`applications.applicationsType.${VMWARE_CLIENT}`),
    type: 'primary',
    has: hasValidLicense
  },
  {
    name: CUSTOM,
    title: i18n.t(`applications.applicationsType.${CUSTOM}`),
    type: 'primary',
    has: hasValidLicense
  }
]

export const MYSQL = 'mysql'
export const ORACLE = 'oracle'
export const POSTGRESQL = 'postgresql'
export const MARIADB = 'mariadb'
export const DATABASE_CATEGORY = 'db'

export const DATABASE = [
  {
    name: MYSQL,
    title: i18n.t(`applications.applicationsType.${MYSQL}`),
    type: 'primary',
    has: true,
    group: i18n.t('applications.Database')
  },
  {
    name: ORACLE,
    title: i18n.t(`applications.applicationsType.${ORACLE}`),
    type: 'primary',
    has: hasValidLicense
  },
  {
    name: POSTGRESQL,
    title: i18n.t(`applications.applicationsType.${POSTGRESQL}`),
    type: 'primary',
    has: hasValidLicense
  },
  {
    name: MARIADB,
    title: i18n.t(`applications.applicationsType.${MARIADB}`),
    type: 'primary',
    has: hasValidLicense
  }
]

export const KUBERNETES = 'k8s'
export const CLOUD_CATEGORY = 'cloud'

export const CLOUD = [
  {
    name: KUBERNETES,
    title: i18n.t(`applications.applicationsType.${KUBERNETES}`),
    group: i18n.t('applications.Cloud'),
    type: 'primary',
    has: true
  }
]

export const ApplicationTypes = [
  ...REMOTE_APP, ...DATABASE, ...CLOUD
]
