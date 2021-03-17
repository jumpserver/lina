import i18n from '@/i18n/i18n'
import store from '@/store'
export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'
export const REMOTEAPP_CATEGORY = 'remote_app'

function hasValidLicense() {
  return store.getters.hasValidLicense
}

export const REMOTE_APP = [
  {
    name: CHROME,
    title: i18n.t(`applications.applicationsType.${CHROME}`),
    type: 'primary',
    group: i18n.t('applications.RemoteApp'),
    category: REMOTEAPP_CATEGORY,
    has: hasValidLicense
  },
  {
    name: MYSQL_WORKBENCH,
    title: i18n.t(`applications.applicationsType.${MYSQL_WORKBENCH}`),
    type: 'primary',
    category: REMOTEAPP_CATEGORY,
    has: hasValidLicense
  },
  {
    name: VMWARE_CLIENT,
    title: i18n.t(`applications.applicationsType.${VMWARE_CLIENT}`),
    type: 'primary',
    category: REMOTEAPP_CATEGORY,
    has: hasValidLicense
  },
  {
    name: CUSTOM,
    title: i18n.t(`applications.applicationsType.${CUSTOM}`),
    type: 'primary',
    category: REMOTEAPP_CATEGORY,
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
    category: DATABASE_CATEGORY,
    has: true,
    group: i18n.t('applications.Database')
  },
  {
    name: ORACLE,
    title: i18n.t(`applications.applicationsType.${ORACLE}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: hasValidLicense
  },
  {
    name: POSTGRESQL,
    title: i18n.t(`applications.applicationsType.${POSTGRESQL}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: hasValidLicense
  },
  {
    name: MARIADB,
    title: i18n.t(`applications.applicationsType.${MARIADB}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
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
    category: CLOUD_CATEGORY,
    has: true
  }
]

export const ApplicationTypes = [
  ...REMOTE_APP, ...DATABASE, ...CLOUD
]
