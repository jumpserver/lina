
export const toLastSucessDisplay = function(object) {
  if (!object) return ['']
  const last_success = object.last_success
  last_success.length || last_success.push('')
  return last_success
}

export const toLastFailureDisplay = function(object) {
  if (!object) return [['', '']]
  const last_failure = []
  for (const host in object.last_failure) {
    const task = object.last_failure[host]
    const msgs = []
    for (const name in task) {
      msgs.push(`${name} => ${task[name].msg}`)
    }

    last_failure.push([host, msgs.join('\n')])
  }

  last_failure.length || last_failure.push(['', ''])
  return last_failure
}
