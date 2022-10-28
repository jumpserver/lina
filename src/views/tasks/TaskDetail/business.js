
export const toLastSucessDisplay = function(object) {
  const last_success = object && object.last_success

  if (!(last_success instanceof Array)) return []
  return last_success.map(host => {
    return {
      hostname: host,
      result: ''
    }
  })
}

export const toLastFailureDisplay = function(object) {
  const last_failure = object && object.last_failure
  if (!(last_failure instanceof Object)) return []

  const ret = []

  for (const host in last_failure) {
    const task = last_failure[host]
    const msgs = []
    for (const name in task) {
      msgs.push(`${name} => ${task[name].msg}`)
    }

    ret.push(
      {
        hostname: host,
        result: msgs.join('\n')
      }
    )
  }

  return ret
}
