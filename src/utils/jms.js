export function openTaskPage(taskId, type = '') {
  window.open(`/#/ops/celery/task/${taskId}/log/?type=${type}`, '', 'width=900,height=600')
}
