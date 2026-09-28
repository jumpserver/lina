const conflictCode = 'account_template_following'

export function isTemplateFollowingConflict(error) {
  const config = error.config
  return (
    error.response?.status === 409 &&
    error.response?.data?.code === conflictCode &&
    !config?.templateFollowingRetried &&
    ['patch', 'put'].includes(config?.method?.toLowerCase()) &&
    /\/accounts\/accounts\/(?:[^/?]+\/)?(?:\?.*)?$/.test(config?.url || '')
  )
}

export async function retryWithoutTemplateFollowing(error, confirm, request) {
  const config = error.config
  const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
  try {
    await confirm()
  } catch {
    error.templateFollowCancelled = true
    throw error
  }
  const detach = (item) => ({ ...item, follow_template: false })
  return request({
    ...config,
    data: Array.isArray(data) ? data.map(detach) : detach(data),
    templateFollowingRetried: true
  })
}
