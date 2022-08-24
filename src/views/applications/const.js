import i18n from '@/i18n/i18n'
import store from '@/store'
import { groupedDropdownToCascader } from '@/utils/common'

export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'
export const REMOTEAPP_CATEGORY = 'remote_app'

function hasLicence() {
  return store.getters.hasValidLicense
}

export const REMOTE_APP = [
  {
    name: CHROME,
    title: i18n.t(`applications.applicationsType.${CHROME}`),
    type: 'primary',
    group: i18n.t('applications.RemoteApp'),
    category: REMOTEAPP_CATEGORY,
    has: hasLicence
  },
  {
    name: MYSQL_WORKBENCH,
    title: i18n.t(`applications.applicationsType.${MYSQL_WORKBENCH}`),
    type: 'primary',
    category: REMOTEAPP_CATEGORY,
    has: hasLicence
  },
  {
    name: VMWARE_CLIENT,
    title: i18n.t(`applications.applicationsType.${VMWARE_CLIENT}`),
    type: 'primary',
    category: REMOTEAPP_CATEGORY,
    has: hasLicence
  },
  {
    name: CUSTOM,
    title: i18n.t(`applications.applicationsType.${CUSTOM}`),
    type: 'primary',
    category: REMOTEAPP_CATEGORY,
    has: hasLicence
  }
]

export const MYSQL = 'mysql'
export const ORACLE = 'oracle'
export const POSTGRESQL = 'postgresql'
export const MARIADB = 'mariadb'
export const DATABASE_CATEGORY = 'db'
export const SQLSERVER = 'sqlserver'
export const REDIS = 'redis'
export const MONGODB = 'mongodb'

export const DATABASE = [
  {
    name: MYSQL,
    title: i18n.t(`applications.applicationsType.${MYSQL}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: true,
    group: i18n.t('applications.RDBProtocol')
  },
  {
    name: MARIADB,
    title: i18n.t(`applications.applicationsType.${MARIADB}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: true
  },
  {
    name: ORACLE,
    title: i18n.t(`applications.applicationsType.${ORACLE}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: hasLicence
  },
  {
    name: POSTGRESQL,
    title: i18n.t(`applications.applicationsType.${POSTGRESQL}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: hasLicence
  },
  {
    name: SQLSERVER,
    title: i18n.t(`applications.applicationsType.${SQLSERVER}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: hasLicence
  }
]

export const KV_DATABASE = [
  {
    name: REDIS,
    title: i18n.t(`applications.applicationsType.${REDIS}`),
    type: 'primary',
    category: DATABASE_CATEGORY,
    has: true,
    group: i18n.t('applications.NoSQLProtocol')
  },
  {
    name: MONGODB,
    title: i18n.t(`applications.applicationsType.${MONGODB}`),
    type: 'primary',
    category: DATABASE_CATEGORY
  }
]

export const AppPlanDatabase = DATABASE

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
  ...DATABASE, ...KV_DATABASE, ...REMOTE_APP, ...CLOUD
]

export const ApplicationSystemUserTypes = [
  ...DATABASE, ...KV_DATABASE, ...CLOUD
]

export const ApplicationCascader = [
  groupedDropdownToCascader(DATABASE),
  groupedDropdownToCascader(KV_DATABASE),
  groupedDropdownToCascader(REMOTE_APP),
  groupedDropdownToCascader(CLOUD)
]
