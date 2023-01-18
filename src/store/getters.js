const getters = {
  sidebar: state => state.app.sidebar,
  defaultOpensMenu: state => state.app.defaultOpensMenu,
  device: state => state.app.device,
  inited: state => state.app.inited,
  isMobile: state => state.app.device === 'mobile',
  token: state => state.users.token,
  consoleOrgs: state => state.users.consoleOrgs,
  auditOrgs: state => state.users.auditOrgs,
  workbenchOrgs: state => state.users.workbenchOrgs,
  noRootWorkbenchOrgs: state => state.users.noRootWorkbenchOrgs,
  usingOrgs: state => state.users.usingOrgs,
  currentOrg: state => state.users.currentOrg,
  currentOrgIsDefault: state => state.users.currentOrg['is_default'],
  currentOrgIsRoot: state => {
    return state.users.currentOrg && state.users.currentOrg['is_root']
  },
  currentRole: state => state.users.currentRole,
  currentUser: state => state.users.profile,
  currentViewRoute: state => state.permission.currentViewRoute,
  viewRoutes: state => state.permission.addRoutes,
  publicSettings: state => state.settings.publicSettings,
  currentOrgRoles: state => state.users.roles,
  currentOrgPerms: state => state.users.perms,
  MFAVerifyAt: state => state.users.MFAVerifyAt,
  MFA_TTl: state => state.settings.publicSettings['SECURITY_MFA_VERIFY_TTL'],
  tableConfig: state => state.table.tableConfig,
  currentUserIsSuperAdmin: state => state.users.isSuperAdmin,
  currentUserIsAdmin: state => state.users.isAdmin,
  hasValidLicense: state => state.settings.hasValidLicense,
  isSystemAdmin: state => state.users.profile.system_roles.some(i => (i?.id === '00000000-0000-0000-0000-000000000001'))
}
export default getters
