const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.users.token,
  currentOrg: state => state.users.currentOrg,
  currentOrgIsDefault: state => state.users.currentOrg['is_default'],
  currentOrgIsRoot: state => state.users.currentOrg['is_root'],
  currentRole: state => state.users.currentRole,
  currentUser: state => state.users.profile,
  permission_routes: state => state.permission.routes,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  publicSettings: state => state.settings.publicSettings,
  currentOrgRoles: state => state.users.roles,
  currentOrgPerms: state => state.users.perms,
  MFAVerifyAt: state => state.users.MFAVerifyAt,
  MFA_TTl: state => state.settings.publicSettings['SECURITY_MFA_VERIFY_TTL'],
  tableConfig: state => state.table.tableConfig,
  currentUserIsSuperAdmin: state => state.users.sysRole === 'Admin',
  hasValidLicense: state => state.settings.hasValidLicense,
  userAdminOrgList: (state, getters) => {
    let orgs = state.users.orgs
    if (!getters.hasValidLicense) {
      orgs = orgs.filter(org => !org['is_root'])
    }
    return orgs
  }
}
export default getters
