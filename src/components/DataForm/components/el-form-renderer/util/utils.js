import _frompairs from 'lodash.frompairs'
import _isplainobject from 'lodash.isplainobject'

export function noop() {}

export function collect(content, key) {
  return _frompairs(
    content
      .map(item => ({
        id: item.id,
        type: item.type,
        value: item.type === 'group' ? collect(item.items, key) : item[key]
      }))
      .filter(
        ({ type, value }) =>
          value !== undefined ||
          (type === 'group' && Object.keys(value).length),
      )
      .map(({ id, value }) => [id, value]),
  )
}

/**
 * 递归合并 oldV & newV，策略如下：
 * 1. 过滤掉 newV 中不存在于 content 中的项
 * 2. 如果该项的 type 不是 GROUP，直接覆盖合并到 oldV
 * 3. 如果是，则递归执行步骤 1 到 3
 */
export function mergeValue(oldV, newV, content) {
  Object.keys(newV).forEach(k => {
    const item = content.find(item => item.id === k)
    if (!item) return
    if (item.type !== 'group') oldV[k] = newV[k]
    else mergeValue(oldV[k], newV[k], item.items)
  })
}

/**
 * 根据 content 中的 outputFormat 来处理 value；
 * 如果 outputFormat 处理后的值是对象类型，会覆盖（Object.assign）到 value 上
 */
export function transformOutputValue(value, content) {
  const newVal = {}
  Object.keys(value).forEach(id => {
    const item = content.find(item => item.id === id)
    if (item.type !== 'group') {
      if (item.outputFormat) {
        const v = item.outputFormat(value[id])
        // REVIEW: 仅根据 format 后的类型来判断赋值形式，有些隐晦
        if (_isplainobject(v)) Object.assign(newVal, v)
        else newVal[id] = v
      } else {
        newVal[id] = value[id]
      }
    } else {
      newVal[id] = transformOutputValue(value[id], item.items)
    }
  })
  return newVal
}

/**
 * 根据 content 中的 inputFormat 来处理 value
 * inputFormat 接受的是当前层级的 value
 * 复杂点在于，不管传入的 value 是否包含某表单项的 key，所有使用了 inputFormat 的项都有可能在这次 update 中被更新
 */
export function transformInputValue(value, content) {
  const newVal = {}
  content.forEach(item => {
    const { id } = item
    if (item.inputFormat) {
      const v = item.inputFormat(value)
      if (v !== undefined) newVal[id] = v
    } else if (id in value) {
      if (item.type !== 'group') {
        newVal[id] = value[id]
      } else {
        newVal[id] = transformInputValue(value[id], item.items)
      }
    }
  })
  return newVal
}

export function correctValue(value, content) {
  content.forEach(({ type, id, items }) => {
    switch (type) {
      case 'group':
        if (!(id in value)) value[id] = {}
        correctValue(value[id], items)
        break
      case 'checkbox-group':
        if (!(id in value)) value[id] = []
        break
    }
  })
}
