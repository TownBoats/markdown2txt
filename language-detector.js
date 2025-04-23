// 立即执行函数，检测用户语言并重定向
;(() => {
  // 如果用户已经在特定语言页面上，不执行重定向
  if (window.location.pathname.includes("/en/")) {
    // 已经在英文页面，设置语言偏好
    localStorage.setItem("md2txt-language", "en")
    return
  }

  // 检查是否有保存的语言偏好
  const savedLanguage = localStorage.getItem("md2txt-language")
  if (savedLanguage) {
    // 如果有保存的语言偏好，根据需要重定向
    if (savedLanguage === "en" && !window.location.pathname.includes("/en/")) {
      window.location.href = "/en/"
    }
    return
  }

  // 检查浏览器语言
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang && browserLang.toLowerCase().startsWith("en")) {
    // 如果浏览器语言是英文，重定向到英文页面
    window.location.href = "/en/"
    localStorage.setItem("md2txt-language", "en")
  } else {
    // 默认设置为中文
    localStorage.setItem("md2txt-language", "zh-CN")
  }
})()
