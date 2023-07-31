import _get from 'lodash.get'
import _has from 'lodash.has'

/**
 * 处理 enableWhen
 *
 * 与条件: 简单依赖关系存在2种情况：简单对象 || 字符串
 * 或条件: 即使用 [] 包裹所有与条件 enableWhen: [{ a: 1 }, { a: 2 }]
 */
export default function getEnableWhenStatus(enableWhen, value) {
  if (!enableWhen) return true
  // 处理一个与条件
  const handleCondition = condition => {
    // 简单字符串(ID), 只要有值即为true
    if (typeof condition === 'string') return _has(value, condition)
    // 简单对象判断: 是否所有依赖条件都通过
    return Object.keys(condition).every(path => {
      const v = _get(value, path)
      return v !== undefined && v === condition[path]
    })
  }

  return Array.isArray(enableWhen)
    ? enableWhen.some(handleCondition)
    : handleCondition(enableWhen)
}
