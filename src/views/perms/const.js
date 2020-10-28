// import i18n from '@/i18n/i18n'
import router from '@/router'
export const CHROME = 'chrome'
export const MYSQL_WORKBENCH = 'mysql_workbench'
export const VMWARE_CLIENT = 'vmware_client'
export const CUSTOM = 'custom'
export const REMOTEAPP_CATEGORY = 'remote_app'

export const REMOTE_APP = [
  {
    name: CHROME,
    title: CHROME,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: CHROME, category: REMOTEAPP_CATEGORY }}) }
  },
  {
    name: MYSQL_WORKBENCH,
    title: MYSQL_WORKBENCH,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: MYSQL_WORKBENCH, category: REMOTEAPP_CATEGORY }}) }
  },
  {
    name: VMWARE_CLIENT,
    title: VMWARE_CLIENT,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: VMWARE_CLIENT, category: REMOTEAPP_CATEGORY }}) }
  },
  {
    name: CUSTOM,
    title: CUSTOM,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: CUSTOM, category: REMOTEAPP_CATEGORY }}) }
  }
]

export const MYSQL = 'mysql'
export const ORACLE = 'oracle'
export const POSTGRESQL = 'postgresql'
export const MARIADB = 'mariadb'
export const DATABASE_CATEGORY = 'database'

export const DATABASE = [
  {
    name: MYSQL,
    title: MYSQL,
    type: 'primary',
    can: true,
    divided: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: MYSQL, category: DATABASE_CATEGORY }}) }
  },
  {
    name: ORACLE,
    title: ORACLE,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: ORACLE, category: DATABASE_CATEGORY }}) }
  },
  {
    name: POSTGRESQL,
    title: POSTGRESQL,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: POSTGRESQL, category: DATABASE_CATEGORY }}) }
  },
  {
    name: MARIADB,
    title: MARIADB,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: MARIADB, category: DATABASE_CATEGORY }}) }
  }
]

export const KUBERNETES = 'k8s'
export const CLOUD_CATEGORY = 'cloud'

export const CLOUD = [
  {
    name: KUBERNETES,
    title: KUBERNETES,
    divided: true,
    type: 'primary',
    can: true,
    callback: function() { router.push({ name: 'ApplicationPermissionCreate', query: { type: KUBERNETES, category: CLOUD_CATEGORY }}) }
  }
]

export const ApplicationTypes = [
  ...REMOTE_APP, ...DATABASE, ...CLOUD
]
