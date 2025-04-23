// 立即执行函数，检测用户语言并重定向
;(() => {
  // 语言-域名映射表
  const DOMAINS = {
    "zh-CN": "https://去星号.com/",
    en: "https://md2txt.com/en/",
  }

  // 如果用户已经在特定语言页面上，设置语言偏好但不重定向
  if (window.location.pathname.includes("/en/")) {
    localStorage.setItem("md2txt-language", "en")
    return
  }

  // 获取URL参数
  function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  }

  // 检查是否有语言参数
  const langParam = getUrlParam("lang")
  if (langParam === "en" || langParam === "zh-CN") {
    localStorage.setItem("md2txt-language", langParam)

    // 如果当前路径与语言不匹配，重定向
    if (langParam === "en" && !window.location.pathname.includes("/en/")) {
      window.location.href = DOMAINS["en"]
      return
    } else if (langParam === "zh-CN" && window.location.pathname.includes("/en/")) {
      window.location.href = DOMAINS["zh-CN"]
      return
    }

    return
  }

  // 检查是否有保存的语言偏好
  const savedLanguage = localStorage.getItem("md2txt-language")
  if (savedLanguage) {
    // 如果当前路径与保存的语言不匹配，重定向
    if (savedLanguage === "en" && !window.location.pathname.includes("/en/")) {
      window.location.href = DOMAINS["en"]
      return
    } else if (savedLanguage === "zh-CN" && window.location.pathname.includes("/en/")) {
      window.location.href = DOMAINS["zh-CN"]
      return
    }

    return
  }

  // 检查浏览器语言
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang && browserLang.toLowerCase().startsWith("en")) {
    localStorage.setItem("md2txt-language", "en")

    // 如果当前不是英文页面，重定向
    if (!window.location.pathname.includes("/en/")) {
      window.location.href = DOMAINS["en"]
    }
  } else {
    // 默认设置为中文
    localStorage.setItem("md2txt-language", "zh-CN")

    // 如果当前是英文页面，重定向
    if (window.location.pathname.includes("/en/")) {
      window.location.href = DOMAINS["zh-CN"]
    }
  }
})()
