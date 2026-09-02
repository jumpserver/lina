const ASSET_CHUNK_SIZE = 100
const MAX_CONCURRENT_REQUESTS = 5
const MAX_DISPLAYED_CONFLICTS = 20

async function fetchAssets(vm, assetIdChunks) {
  const queue = [...assetIdChunks]
  const assets = []
  const worker = async () => {
    while (queue.length) {
      const ids = queue.shift()
      const data = await vm.$axios.get('/api/v1/assets/assets/', {
        params: {
          id__in: ids.join(','),
          limit: ids.length,
          fields_size: 'mini'
        }
      })
      assets.push(...(Array.isArray(data) ? data : data.results || []))
    }
  }
  const workerCount = Math.min(MAX_CONCURRENT_REQUESTS, queue.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return assets
}

export async function confirmZoneOverwrite(vm, assetIds, targetZoneId = null) {
  if (vm.isSubmitting) {
    return false
  }

  if (!assetIds.length) {
    return true
  }

  const assetIdChunks = []
  for (let i = 0; i < assetIds.length; i += ASSET_CHUNK_SIZE) {
    assetIdChunks.push(assetIds.slice(i, i + ASSET_CHUNK_SIZE))
  }

  vm.isSubmitting = true
  try {
    const assets = await fetchAssets(vm, assetIdChunks)
    const conflicts = assets.filter((asset) => {
      const zoneId = asset.zone?.id
      return zoneId && String(zoneId) !== String(targetZoneId)
    })

    if (!conflicts.length) {
      return true
    }

    const displayedConflicts = conflicts.slice(0, MAX_DISPLAYED_CONFLICTS)
    let conflictAssets = displayedConflicts
      .map(asset => `${asset.name} (${asset.zone.name})`)
      .join(', ')
    const remainingCount = conflicts.length - displayedConflicts.length
    if (remainingCount > 0) {
      const remaining = vm.$t('AssetsInOtherZonesRemaining', { count: remainingCount })
      conflictAssets = `${conflictAssets}, ${remaining}`
    }

    try {
      await vm.$confirm(
        vm.$t('AssetsInOtherZonesConfirm', { assets: conflictAssets }),
        vm.$t('AssetsInOtherZonesTitle'),
        {
          confirmButtonText: vm.$t('Confirm'),
          cancelButtonText: vm.$t('Cancel'),
          type: 'warning'
        }
      )
      return true
    } catch (e) {
      return false
    }
  } catch (error) {
    if (!error.response) {
      vm.$message.error(vm.$t('ServerError'))
    }
    return false
  } finally {
    vm.isSubmitting = false
  }
}
