// This file should be included before any other scripts
;(() => {
  // Function to get URL parameters
  function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  }

  // Function to get preferred language
  function getPreferredLanguage() {
    // 1. Check URL path first
    if (window.location.pathname.indexOf("/en") === 0) {
      return "en"
    }

    // 2. Check URL parameter
    const langParam = getUrlParam("lang")
    if (langParam === "en" || langParam === "zh-CN") {
      return langParam
    }

    // 3. Check localStorage
    const savedLang = localStorage.getItem("md2txt-language")
    if (savedLang) {
      return savedLang
    }

    // 4. Check browser language
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang && browserLang.indexOf("en") === 0) {
      return "en"
    }

    // 5. Default to Chinese
    return "zh-CN"
  }

  // Set the language immediately to avoid flicker
  const preferredLanguage = getPreferredLanguage()
  document.documentElement.lang = preferredLanguage

  // Store the language preference
  localStorage.setItem("md2txt-language", preferredLanguage)

  // Add a class to the html element for CSS targeting
  document.documentElement.classList.add("lang-" + preferredLanguage.replace("-", ""))

  // If we're not on the correct URL path for this language, redirect
  const currentPath = window.location.pathname
  if (preferredLanguage === "en" && !currentPath.startsWith("/en")) {
    // Redirect to English version
    window.location.href = "/en" + (currentPath === "/" ? "" : currentPath)
  } else if (preferredLanguage === "zh-CN" && currentPath.startsWith("/en")) {
    // Redirect to Chinese version
    window.location.href = currentPath.replace(/^\/en/, "")
  }
})()
