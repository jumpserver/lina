// Approval mode is represented by the existing action and workflow fields.
export function approvalActionMeta(meta, t) {
  meta.action.choices = meta.action.choices.flatMap((choice) =>
    choice.value === 'review'
      ? [
          { ...choice, label: t('SimpleApproval') },
          { ...choice, value: 'workflow_review', label: t('WorkflowApproval') }
        ]
      : [choice]
  )
  return meta
}

export function approvalFormValue(value) {
  const action = value.action?.value || value.action
  return { ...value, action: action === 'review' && value.workflow ? 'workflow_review' : action }
}

export function cleanApprovalFormValue(value) {
  if (value.action === 'workflow_review') {
    value.action = 'review'
  } else {
    value.workflow = null
  }
  return value
}

export function approvalActionLabel(row, t) {
  return row.action?.value === 'review'
    ? t(row.workflow ? 'WorkflowApproval' : 'SimpleApproval')
    : row.action?.label
}
