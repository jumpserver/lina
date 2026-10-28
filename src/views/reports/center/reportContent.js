export function reportTableStatus(table, section) {
  return table.source_status || section.status
}

export function isEmptyReportTable(table, section) {
  if (!['available', 'complete'].includes(reportTableStatus(table, section))) return false
  if (table.total === 0 && !table.rows?.length) return true
  const trend = reportTrend(table)
  return trend != null && trend.total === 0
}

export function reportEmptySectionKey(section) {
  if (
    ['overview', 'conclusion', 'scope', 'coverage'].includes(section.key) ||
    !['available', 'complete'].includes(section.status) ||
    section.has_issues ||
    (section.metrics || []).some(
      (metric) => metric.value == null && metric.state !== 'not_applicable'
    ) ||
    (section.tables || []).some((table) => !isEmptyReportTable(table, section))
  ) {
    return ''
  }
  const reviewSection = ['security', 'remediation'].includes(section.key)
  const hasActivity = (section.metrics || []).some((metric) => Number(metric.value) > 0)
  return reviewSection && !hasActivity ? 'AuditReportNoReviewRecords' : 'AuditReportNoPeriodRecords'
}

export function reportTrend(table) {
  if (
    table.key !== 'session_trend' ||
    ['unavailable', 'permission_denied'].includes(table.source_status) ||
    !table.rows?.length ||
    table.rows.some(
      (row) => typeof row.count !== 'number' || !Number.isFinite(row.count) || row.count < 0
    )
  ) {
    return null
  }
  const rows = table.rows
  const peak = Math.max(...rows.map((row) => row.count))
  const peakRows = peak > 0 ? rows.filter((row) => row.count === peak) : []
  const maximum = Math.max(1, peak)
  const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])]
  return {
    rows,
    total: rows.reduce((total, row) => total + row.count, 0),
    active: rows.filter((row) => row.count > 0).length,
    periods: rows.length,
    peak,
    peakDates:
      peakRows
        .slice(0, 3)
        .map((row) => row.date)
        .join(', ') + (peakRows.length > 3 ? ' …' : ''),
    maximum,
    ticks: [...new Set([0, Math.ceil(maximum / 2), maximum])],
    labels: labelIndexes.map((index) => rows[index].date)
  }
}

export function isReportCountColumn(key) {
  return key === 'count' || key.endsWith('_count')
}
