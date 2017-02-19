function pluralize (time, label) {
  return time + label + '前'
}

export function timeAgo (time) {
  const between = (+Date.now() - +new Date(time)) / 1000
  if (between < 60) {
    return pluralize(~~(between), ' 秒')
  } else if (between < 3600) {
    return pluralize(~~(between / 60), ' 分钟')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' 小时')
  } else if (between < (86400 * 30)) {
    return pluralize(~~(between / 86400), ' 天')
  } else if (between < (86400 * 30 * 12)) {
    return pluralize(~~(between / (86400 * 30)), '个月')
  } else {
    return pluralize(~~(between / (86400 * 30 * 12)), '年')
  }
}

export function formatDate (date, fmt) {
  date = new Date(date)
  fmt = fmt || 'yyyy-MM-dd hh:mm'
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

export function translateTab (tab, isTop) {
  if (isTop) {
    return '置顶'
  } else {
    switch (tab) {
      case 'share':
        return '分享'
      case 'ask':
        return '问答'
      case 'job':
        return '招聘'
      case 'good':
        return '精华'
      case 'top':
        return '置顶'
    }
  }
}
