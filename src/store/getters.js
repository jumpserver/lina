const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.users.token,
  currentOrg: state => state.users.currentOrg,
  userAdminOrgList: state => state.users.orgs,
  currentUser: state => state.users.profile,
  permission_routes: state => state.permission.routes,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  publicSettings: state => state.settings.publicSettings
}
export default getters
