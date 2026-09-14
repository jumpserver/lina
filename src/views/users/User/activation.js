export async function confirmDisableUsers(vm, users) {
  if (users.some(user => user.id === vm.$store.getters.currentUser.id)) {
    vm.$message.warning(vm.$t('CannotDisableOwnAccount'))
    return false
  }
  const admins = users.filter(user => user.is_active && user.is_superuser)
  if (!admins.length) return true

  const names = admins.map(user => user.username).join(', ')
  try {
    await vm.$confirm(vm.$t('DisableSystemAdminsWarning', { users: names }), vm.$t('Info'), {
      type: 'warning',
      confirmButtonText: vm.$t('Confirm'),
      cancelButtonText: vm.$t('Cancel')
    })
    return true
  } catch {
    return false
  }
}
