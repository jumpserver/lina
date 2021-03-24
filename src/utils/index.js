/**
 * Created by PanJiaChen on 16/11/18.
 */

import jsPDF from 'jspdf'

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}

// 将标准时间转换成时间戳
export function getDateTimeStamp(dateStr) {
  return Date.parse(dateStr.replace(/-/gi, '/'))
}

export function exportPdf(name, canvasList) {
  // eslint-disable-next-line new-cap
  const pdf = new jsPDF('', 'pt', 'a4')
  // 当前页面的当前高度
  let currentHeight = 0
  for (const canvas of canvasList) {
    if (canvas) {
      const contentWidth = canvas.width
      const contentHeight = canvas.height

      // a4纸的尺寸[595.28,841.89]
      const a4Width = 592.28
      const a4Height = 841.89

      // html页面生成的canvas在pdf中图片的宽高
      const imgWidth = a4Width
      const imgHeight = a4Width / contentWidth * contentHeight

      const pageData = canvas.toDataURL('image/jpeg', 1.0)

      // 当前图片的剩余高度
      let leftHeight = imgHeight

      // 当前页面的剩余高度
      const blankHeight = a4Height - currentHeight

      if (leftHeight > blankHeight) {
        // 页面偏移
        let position = 0
        while (leftHeight > 0) {
          // 本次添加占用的高度
          const occupation = a4Height - currentHeight
          pdf.addImage(pageData, 'JPEG', 0, position + currentHeight, imgWidth, imgHeight)
          currentHeight = leftHeight
          leftHeight -= occupation
          position -= occupation
          // 避免添加空白页
          if (leftHeight > 0) {
            pdf.addPage()
            currentHeight = 0
          }
        }
      } else {
        pdf.addImage(pageData, 'JPEG', 0, currentHeight, imgWidth, imgHeight)
        currentHeight += imgHeight
      }
    }
  }

  pdf.save(name.replace(' ', '_') + '.pdf')
}

