// DOM 元素
const markdownEditor = document.getElementById("markdown-editor")
const txtPreview = document.getElementById("txt-preview")
const themeToggle = document.getElementById("theme-toggle")
const languageToggle = document.getElementById("language-toggle")
const languageSelect = document.getElementById("language-select")
const importBtn = document.getElementById("import-btn")
const fileInput = document.getElementById("file-input")
const clearBtn = document.getElementById("clear-btn")
const copyBtn = document.getElementById("copy-btn")
const downloadBtn = document.getElementById("download-btn")
const settingsBtn = document.getElementById("settings-btn")
const settingsContainer = document.getElementById("settings-container")
const closeSettings = document.getElementById("close-settings")
const notification = document.getElementById("notification")

// 字体控制按钮
const mdFontDecrease = document.getElementById("md-font-decrease")
const mdFontIncrease = document.getElementById("md-font-increase")
const txtFontDecrease = document.getElementById("txt-font-decrease")
const txtFontIncrease = document.getElementById("txt-font-increase")

// 设置控件
const fontSizeRange = document.getElementById("font-size-range")
const fontSizeValue = document.getElementById("font-size-value")
const lineHeightRange = document.getElementById("line-height-range")
const lineHeightValue = document.getElementById("line-height-value")
const autosaveToggle = document.getElementById("autosave-toggle")

// 默认设置
let settings = {
  fontSize: 16,
  lineHeight: 1.5,
  autosave: true,
  theme: "light",
  language: "zh-CN", // 默认语言
}

// 多域名配置
const DOMAINS = {
  primary: "去星号.com",
  alternate: "md2txt.com",
  punycode: "xn--kpry91d2gx.com", // 去星号.com的Punycode编码
}

// 当前域名
const CURRENT_DOMAIN = window.location.hostname

// 语言配置
const TRANSLATIONS = {
  "zh-CN": {
    title: "DeepSeek去星号 - Markdown转TXT工具 | Markdown Text Format 转换器",
    placeholder: "在此输入Markdown格式的文本...",
    welcome: "欢迎使用DeepSeek去星号-markdown转txt工具！",
    imported: "已导入",
    cleared: "内容已清空",
    copied: "TXT内容已复制到剪贴板",
    copyFailed: "复制失败，请尝试手动复制",
    downloaded: "已下载",
    saved: "内容已保存",
    saveFailed: "保存失败",
    clearConfirm: "确定要清空所有内容吗？",
    example: `# DeepSeek去星号工具使用示例

这里**粘贴**原文，支持 *Markdown Text Format* 格式。

## 功能特点

- 自动转换Markdown Text为纯文本
- 支持暗黑模式
- 自动保存内容
- 导入/导出文件

> 欢迎使用我们的Markdown工具(Markdown Tools)！

---

最后更新: 2025-04-23`,
  },
  en: {
    title: "DeepSeek Markdown Text Format Converter | MD2TXT Tool",
    placeholder: "Enter your Markdown text here...",
    welcome: "Welcome to DeepSeek Markdown Text Format Converter!",
    imported: "Imported",
    cleared: "Content cleared",
    copied: "TXT content copied to clipboard",
    copyFailed: "Copy failed, please try manually",
    downloaded: "Downloaded",
    saved: "Content saved",
    saveFailed: "Save failed",
    clearConfirm: "Are you sure you want to clear all content?",
    example: `# DeepSeek Markdown Text Format Converter

Paste your **markdown text** here to convert it to plain text format.

## Features

- Convert Markdown text format to plain text
- Dark mode support
- Auto-save functionality
- Import/export files

> Welcome to our Markdown tools suite!

---

Last updated: April 23, 2025`,
  },
}

// 页面元数据 - 用于SEO
const PAGE_METADATA = {
  title: {
    "zh-CN": "DeepSeek去星号 - Markdown转TXT工具 | Markdown Text Format 转换器",
    en: "DeepSeek Markdown Text Format Converter | MD2TXT Tool",
  },
  description: {
    "zh-CN":
      "DeepSeek去星号是一款免费在线工具，可以将Markdown格式文本(Markdown Text)快速转换为纯文本(TXT)格式，去除所有格式标记，保留原文内容。",
    en: "DeepSeek Markdown Text Format Converter is a free online tool that quickly converts Markdown text to plain text (TXT) format, removing all formatting marks while preserving content.",
  },
  keywords: "markdown text format, markdown text, markdown tools, markdown2, markdown转txt, 文本格式转换",
  lastUpdated: "2025-04-23",
}

// 声明 Toastify 和 gtag (如果未定义)
const Toastify =
  window.Toastify ||
  ((options) => {
    console.log("Toast:", options.text)
  })
const gtag =
  window.gtag ||
  ((eventName, eventParams) => {
    console.log("Analytics event:", eventName, eventParams)
  })

// 加载已保存设置（若存在）
function loadSettings() {
  try {
    // 使用localStorage存储设置，如不可用则使用默认值
    const savedSettings = localStorage.getItem("md2txt-settings")
    if (savedSettings) {
      settings = JSON.parse(savedSettings)
    }
  } catch (error) {
    console.error("加载设置失败:", error)
  }

  // 应用设置值到控件
  fontSizeRange.value = settings.fontSize
  fontSizeValue.textContent = `${settings.fontSize}px`
  lineHeightRange.value = settings.lineHeight
  lineHeightValue.textContent = settings.lineHeight
  autosaveToggle.checked = settings.autosave

  // 设置语言选择器
  if (languageSelect) {
    languageSelect.value = settings.language || "zh-CN"
  }

  applySettings()
  applyLanguage(settings.language || "zh-CN")

  // 应用主题
  if (settings.theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }

  // 如果有自动保存的内容则加载
  if (settings.autosave) {
    try {
      const savedContent = localStorage.getItem("md2txt-content")
      if (savedContent) {
        markdownEditor.value = savedContent
      }
    } catch (error) {
      console.error("加载内容失败:", error)
    }
  }
}

// 保存设置
function saveSettings() {
  try {
    localStorage.setItem("md2txt-settings", JSON.stringify(settings))
    console.log("设置已保存")
  } catch (error) {
    console.error("保存设置失败:", error)
    showToast(TRANSLATIONS[settings.language].saveFailed, "error")
  }
}

// 应用设置
function applySettings() {
  markdownEditor.style.fontSize = `${settings.fontSize}px`
  txtPreview.style.fontSize = `${settings.fontSize}px`
  markdownEditor.style.lineHeight = settings.lineHeight
  txtPreview.style.lineHeight = settings.lineHeight
}

// 应用语言设置
function applyLanguage(lang) {
  // 保存语言设置
  settings.language = lang
  saveSettings()

  // 设置HTML语言属性
  document.documentElement.lang = lang

  // 更新页面标题
  document.title = PAGE_METADATA.title[lang] || PAGE_METADATA.title["zh-CN"]

  // 更新placeholder
  markdownEditor.placeholder = TRANSLATIONS[lang].placeholder

  // 显示/隐藏对应语言的元素
  const zhElements = document.querySelectorAll(".lang-zh")
  const enElements = document.querySelectorAll(".lang-en")

  if (lang === "en") {
    zhElements.forEach((el) => el.classList.add("hidden"))
    enElements.forEach((el) => el.classList.remove("hidden"))
  } else {
    zhElements.forEach((el) => el.classList.remove("hidden"))
    enElements.forEach((el) => el.classList.add("hidden"))
  }

  // 更新语言选择器
  if (languageSelect) {
    languageSelect.value = lang
  }
}

// Markdown 转 TXT 核心功能
function convertMarkdownToTxt(markdown) {
  if (!markdown) return ""

  let txt = markdown

  // 处理标题
  txt = txt.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, content) => {
    const level = hashes.length
    const indent = "  ".repeat(level - 1)
    return `${indent}${content}`
  })

  // 处理粗体和斜体
  txt = txt.replace(/(\*\*|__)(.*?)\1/g, "$2") // 移除粗体标记
  txt = txt.replace(/(\*|_)(.*?)\1/g, "$2") // 移除斜体标记

  // 处理行内代码
  txt = txt.replace(/`([^`]+)`/g, "$1")

  // 处理代码块，保持缩进
  txt = txt.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, (match, code) => {
    return code
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")
  })

  // 处理有序列表和无序列表
  txt = txt.replace(/^(\s*)([*\-+]|\d+\.)\s+(.*)$/gm, (match, indent, bullet, content) => {
    if (/^\d+\./.test(bullet)) {
      // 有序列表
      return `${indent}${bullet} ${content}`
    } else {
      // 无序列表
      return `${indent}- ${content}`
    }
  })

  // 处理链接，只保留链接文本
  txt = txt.replace(/\[([^\]]+)\]$$[^$$]+\)/g, "$1")

  // 处理图片，只保留 alt 文本
  txt = txt.replace(/!\[([^\]]+)\]$$[^$$]+\)/g, "[图片: $1]")

  // 处理水平线
  txt = txt.replace(/^(\s*?)-{3,}(\s*)$/gm, "----------------------------")

  // 移除 HTML 标签
  txt = txt.replace(/<[^>]*>/g, "")

  return txt
}

// 显示通知 - 使用Toastify
function showToast(message, type = "success", duration = 3000) {
  const bgColors = {
    success: "linear-gradient(to right, #00b09b, #96c93d)",
    error: "linear-gradient(to right, #ff5f6d, #ffc371)",
    info: "linear-gradient(to right, #2193b0, #6dd5ed)",
  }

  Toastify({
    text: message,
    duration: duration,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: bgColors[type] || bgColors.info,
    },
  }).showToast()
}

// 自动保存功能
let autoSaveTimeout
function setupAutoSave() {
  if (settings.autosave) {
    markdownEditor.addEventListener("input", () => {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = setTimeout(() => {
        try {
          localStorage.setItem("md2txt-content", markdownEditor.value)
          console.log("内容已自动保存")
        } catch (error) {
          console.error("自动保存失败:", error)
        }
      }, 1000)
    })
  }
}

// 更新预览
function updatePreview() {
  const markdown = markdownEditor.value
  const txt = convertMarkdownToTxt(markdown)
  txtPreview.textContent = txt

  // 更新页面标题，提高SEO相关性
  updatePageTitle(markdown)
}

// 更新页面标题 - SEO优化
function updatePageTitle(markdown) {
  const lang = settings.language || "zh-CN"

  // 如果markdown内容有标题，则提取第一个标题作为页面标题的一部分
  if (markdown && markdown.length > 10) {
    const titleMatch = markdown.match(/^#\s+(.+)$/m)
    if (titleMatch && titleMatch[1]) {
      const contentTitle = titleMatch[1].trim()
      document.title = `${contentTitle} | ${PAGE_METADATA.title[lang]}`
      return
    }
  }

  // 如果没有提取到标题，使用默认标题
  document.title = PAGE_METADATA.title[lang]
}

// 同步滚动
function setupSyncScroll() {
  markdownEditor.addEventListener("scroll", () => {
    const percentage = markdownEditor.scrollTop / (markdownEditor.scrollHeight - markdownEditor.clientHeight)
    txtPreview.scrollTop = percentage * (txtPreview.scrollHeight - txtPreview.clientHeight)
  })
}

// 字体大小控制
function setupFontControls() {
  mdFontDecrease.addEventListener("click", () => {
    if (settings.fontSize > 12) {
      settings.fontSize--
      fontSizeRange.value = settings.fontSize
      fontSizeValue.textContent = `${settings.fontSize}px`
      applySettings()
      saveSettings()
    }
  })

  mdFontIncrease.addEventListener("click", () => {
    if (settings.fontSize < 24) {
      settings.fontSize++
      fontSizeRange.value = settings.fontSize
      fontSizeValue.textContent = `${settings.fontSize}px`
      applySettings()
      saveSettings()
    }
  })

  txtFontDecrease.addEventListener("click", () => {
    if (settings.fontSize > 12) {
      settings.fontSize--
      fontSizeRange.value = settings.fontSize
      fontSizeValue.textContent = `${settings.fontSize}px`
      applySettings()
      saveSettings()
    }
  })

  txtFontIncrease.addEventListener("click", () => {
    if (settings.fontSize < 24) {
      settings.fontSize++
      fontSizeRange.value = settings.fontSize
      fontSizeValue.textContent = `${settings.fontSize}px`
      applySettings()
      saveSettings()
    }
  })
}

// 导入文件
function setupFileImport() {
  importBtn.addEventListener("click", () => {
    fileInput.click()
  })

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      markdownEditor.value = event.target.result
      updatePreview()
      if (settings.autosave) {
        try {
          localStorage.setItem("md2txt-content", markdownEditor.value)
        } catch (error) {
          console.error("保存导入内容失败:", error)
        }
      }

      const lang = settings.language || "zh-CN"
      showToast(`${TRANSLATIONS[lang].imported}: ${file.name}`, "success")

      // 跟踪文件导入事件 - 用于分析
      trackEvent("file_import", {
        file_type: file.type,
        file_size: file.size,
        domain: CURRENT_DOMAIN,
        language: lang,
      })
    }
    reader.readAsText(file)
  })
}

// 清空内容
function setupClearButton() {
  clearBtn.addEventListener("click", () => {
    const lang = settings.language || "zh-CN"
    if (confirm(TRANSLATIONS[lang].clearConfirm)) {
      markdownEditor.value = ""
      updatePreview()
      if (settings.autosave) {
        try {
          localStorage.setItem("md2txt-content", "")
        } catch (error) {
          console.error("清空内容保存失败:", error)
        }
      }
      showToast(TRANSLATIONS[lang].cleared, "info")

      // 重置页面标题
      document.title = PAGE_METADATA.title[lang]
    }
  })
}

// 复制TXT
function setupCopyButton() {
  copyBtn.addEventListener("click", () => {
    const txt = txtPreview.textContent
    const lang = settings.language || "zh-CN"

    navigator.clipboard
      .writeText(txt)
      .then(() => {
        showToast(TRANSLATIONS[lang].copied, "success")

        // 跟踪复制事件
        trackEvent("copy_text", {
          content_length: txt.length,
          domain: CURRENT_DOMAIN,
          language: lang,
        })
      })
      .catch((err) => {
        console.error("复制失败:", err)
        showToast(TRANSLATIONS[lang].copyFailed, "error")
      })
  })
}

// 下载TXT
function setupDownloadButton() {
  downloadBtn.addEventListener("click", () => {
    const txt = txtPreview.textContent
    const blob = new Blob([txt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const lang = settings.language || "zh-CN"

    // 尝试从内容中提取文件名
    let fileName = "markdown2txt"
    const titleMatch = markdownEditor.value.match(/^#\s+(.+)$/m)
    if (titleMatch && titleMatch[1]) {
      // 从标题生成文件名，移除不合法字符
      fileName = titleMatch[1]
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()
    }

    a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`${TRANSLATIONS[lang].downloaded} ${a.download}`, "success")

    // 跟踪下载事件
    trackEvent("download_txt", {
      file_name: a.download,
      content_length: txt.length,
      domain: CURRENT_DOMAIN,
      language: lang,
    })
  })
}

// 设置面板
function setupSettingsPanel() {
  settingsBtn.addEventListener("click", () => {
    settingsContainer.style.display = "flex"
  })

  closeSettings.addEventListener("click", () => {
    settingsContainer.style.display = "none"
  })

  settingsContainer.addEventListener("click", (e) => {
    if (e.target === settingsContainer) {
      settingsContainer.style.display = "none"
    }
  })

  fontSizeRange.addEventListener("input", () => {
    settings.fontSize = Number.parseInt(fontSizeRange.value)
    fontSizeValue.textContent = `${settings.fontSize}px`
    applySettings()
  })

  fontSizeRange.addEventListener("change", () => {
    saveSettings()
  })

  lineHeightRange.addEventListener("input", () => {
    settings.lineHeight = Number.parseFloat(lineHeightRange.value)
    lineHeightValue.textContent = settings.lineHeight
    applySettings()
  })

  lineHeightRange.addEventListener("change", () => {
    saveSettings()
  })

  autosaveToggle.addEventListener("change", () => {
    settings.autosave = autosaveToggle.checked
    saveSettings()
    // 如果禁用自动保存，清除相关数据
    if (!settings.autosave) {
      try {
        localStorage.removeItem("md2txt-content")
      } catch (error) {
        console.error("清除自动保存内容失败:", error)
      }
    }
  })

  // 语言选择器
  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      const newLang = languageSelect.value

      // 保存语言偏好
      localStorage.setItem("md2txt-language", newLang)

      // 根据选择的语言重定向到相应页面
      if (newLang === "en" && !window.location.pathname.includes("/en/")) {
        window.location.href = "/en/"
        return
      } else if (newLang === "zh-CN" && window.location.pathname.includes("/en/")) {
        window.location.href = "/"
        return
      }

      // 如果在同一页面上，应用语言设置
      applyLanguage(newLang)

      // 如果内容为空，添加对应语言的示例内容
      if (!markdownEditor.value) {
        markdownEditor.value = TRANSLATIONS[newLang].example
        updatePreview()
      }

      // 跟踪语言切换事件
      trackEvent("language_change", {
        language: newLang,
        domain: CURRENT_DOMAIN,
      })
    })
  }
}

// 主题切换
function setupThemeToggle() {
  themeToggle.addEventListener("click", () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark")
      settings.theme = "light"
    } else {
      document.documentElement.classList.add("dark")
      settings.theme = "dark"
    }
    saveSettings()

    // 跟踪主题切换事件
    trackEvent("theme_change", {
      theme: settings.theme,
      domain: CURRENT_DOMAIN,
      language: settings.language,
    })
  })
}

// 语言切换
function setupLanguageToggle() {
  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      const currentLang = settings.language || "zh-CN"
      const newLang = currentLang === "zh-CN" ? "en" : "zh-CN"
      applyLanguage(newLang)

      // 如果内容为空，添加对应语言的示例内容
      if (!markdownEditor.value) {
        markdownEditor.value = TRANSLATIONS[newLang].example
        updatePreview()
      }

      // 跟踪语言切换事件
      trackEvent("language_toggle", {
        from: currentLang,
        to: newLang,
        domain: CURRENT_DOMAIN,
      })
    })
  }
}

// 防止意外关闭
function setupBeforeUnload() {
  window.addEventListener("beforeunload", (e) => {
    // 如果有未保存内容且启用了自动保存
    if (markdownEditor.value && settings.autosave) {
      try {
        localStorage.setItem("md2txt-content", markdownEditor.value)
      } catch (error) {
        console.error("离开前保存失败:", error)
      }
    }

    // 如果内容非空且与未保存内容不同
    if (markdownEditor.value && !settings.autosave) {
      e.preventDefault()
      e.returnValue = ""
      return ""
    }
  })
}

// 键盘快捷键
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const lang = settings.language || "zh-CN"

    // Ctrl+S: 保存
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      try {
        localStorage.setItem("md2txt-content", markdownEditor.value)
        showToast(TRANSLATIONS[lang].saved, "success")

        // 跟踪手动保存事件
        trackEvent("manual_save", {
          content_length: markdownEditor.value.length,
          domain: CURRENT_DOMAIN,
          language: lang,
        })
      } catch (error) {
        console.error("保存失败:", error)
        showToast(TRANSLATIONS[lang].saveFailed, "error")
      }
    }

    // Ctrl+D: 下载
    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault()
      downloadBtn.click()
    }

    // Ctrl+Shift+C: 复制TXT
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
      e.preventDefault()
      copyBtn.click()
    }

    // Escape: 关闭设置面板
    if (e.key === "Escape" && settingsContainer.style.display === "flex") {
      settingsContainer.style.display = "none"
    }

    // Ctrl+Shift+L: 切换语言
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
      e.preventDefault()
      const currentLang = settings.language || "zh-CN"
      const newLang = currentLang === "zh-CN" ? "en" : "zh-CN"
      applyLanguage(newLang)
    }
  })
}

// 事件跟踪 - 用于分析
function trackEvent(eventName, eventParams = {}) {
  // 如果有Google Analytics
  if (typeof gtag === "function") {
    gtag(eventName, eventParams)
  }

  // 如果有自定义分析
  console.log(`Event tracked: ${eventName}`, eventParams)
}

// 添加SEO相关的元数据
function setupSEO() {
  const lang = settings.language || "zh-CN"

  // 设置页面标题
  document.title = PAGE_METADATA.title[lang]

  // 如果页面中没有描述和关键词meta标签，则添加
  if (!document.querySelector('meta[name="description"]')) {
    const metaDesc = document.createElement("meta")
    metaDesc.name = "description"
    metaDesc.content = PAGE_METADATA.description[lang]
    document.head.appendChild(metaDesc)
  }

  if (!document.querySelector('meta[name="keywords"]')) {
    const metaKeywords = document.createElement("meta")
    metaKeywords.name = "keywords"
    metaKeywords.content = PAGE_METADATA.keywords
    document.head.appendChild(metaKeywords)
  }

  // 添加最后更新日期
  if (!document.querySelector('meta[name="last-modified"]')) {
    const metaLastMod = document.createElement("meta")
    metaLastMod.name = "last-modified"
    metaLastMod.content = PAGE_METADATA.lastUpdated
    document.head.appendChild(metaLastMod)
  }
}

// 性能优化
function optimizePerformance() {
  // 使用requestAnimationFrame优化滚动和渲染
  let ticking = false
  markdownEditor.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const percentage = markdownEditor.scrollTop / (markdownEditor.scrollHeight - markdownEditor.clientHeight)
        txtPreview.scrollTop = percentage * (txtPreview.scrollHeight - txtPreview.clientHeight)
        ticking = false
      })
      ticking = true
    }
  })

  // 使用防抖优化输入处理
  let debounceTimeout
  markdownEditor.addEventListener("input", () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      updatePreview()
    }, 150) // 150ms防抖
  })
}

// 初始化
function init() {
  // 优先应用主题设置
  try {
    const savedSettings = localStorage.getItem("md2txt-settings")
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      if (parsedSettings.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  } catch (error) {
    console.error("加载主题设置失败:", error)
  }

  // 设置SEO相关元数据
  setupSEO()

  // 加载设置并初始化功能
  loadSettings()
  setupAutoSave()
  updatePreview()
  setupSyncScroll()
  setupFontControls()
  setupFileImport()
  setupClearButton()
  setupCopyButton()
  setupDownloadButton()
  setupSettingsPanel()
  setupThemeToggle()
  setupLanguageToggle()
  setupBeforeUnload()
  setupKeyboardShortcuts()
  optimizePerformance()

  // 监听输入更新预览
  markdownEditor.addEventListener("input", updatePreview)

  // 获取当前语言
  const lang = settings.language || "zh-CN"

  // 如果内容为空，添加示例内容
  if (!markdownEditor.value) {
    markdownEditor.value = TRANSLATIONS[lang].example
    updatePreview()
  }

  // 首次加载完成提示
  setTimeout(() => {
    showToast(TRANSLATIONS[lang].welcome, "info")

    // 跟踪页面加载完成事件
    trackEvent("app_loaded", {
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      theme: settings.theme,
      domain: CURRENT_DOMAIN,
      language: lang,
    })
  }, 500)
}

// 启动应用
document.addEventListener("DOMContentLoaded", init)
