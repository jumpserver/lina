const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.users.token,
  currentOrg: state => state.users.currentOrg,
  currentOrgIsDefault: state => state.users.currentOrg['is_default'],
  currentOrgIsRoot: state => state.users.currentOrg['is_root'],
  currentRole: state => state.users.currentRole,
  currentUser: state => state.users.profile,
  currentViewRoute: state => state.permission.currentViewRoute,
  publicSettings: state => state.settings.publicSettings,
  currentOrgRoles: state => state.users.roles,
  currentOrgPerms: state => state.users.perms,
  MFAVerifyAt: state => state.users.MFAVerifyAt,
  MFA_TTl: state => state.settings.publicSettings['SECURITY_MFA_VERIFY_TTL'],
  tableConfig: state => state.table.tableConfig,
  currentUserIsSuperAdmin: state => state.users.sysRole === 'Admin',
  hasValidLicense: state => state.settings.hasValidLicense,
  orgs: state => state.users.orgs
}
export default getters
