export const auditReportPermissions = {
  audit: 'rbac.view_auditreport',
  activity: 'rbac.view_activityreport',
  security: 'rbac.view_securityreport',
  inventory: 'rbac.view_inventoryreport',
  account: 'rbac.view_accountreport'
}

export const anyAuditReportPermission = Object.values(auditReportPermissions).join(' | ')
