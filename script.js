// DOM 元素
const markdownEditor = document.getElementById('markdown-editor');
const txtPreview = document.getElementById('txt-preview');
const themeToggle = document.getElementById('theme-toggle');
const importBtn = document.getElementById('import-btn');
const fileInput = document.getElementById('file-input');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsContainer = document.getElementById('settings-container');
const closeSettings = document.getElementById('close-settings');
const notification = document.getElementById('notification');

// 字体控制按钮
const mdFontDecrease = document.getElementById('md-font-decrease');
const mdFontIncrease = document.getElementById('md-font-increase');
const txtFontDecrease = document.getElementById('txt-font-decrease');
const txtFontIncrease = document.getElementById('txt-font-increase');

// 设置控件
const fontSizeRange = document.getElementById('font-size-range');
const fontSizeValue = document.getElementById('font-size-value');
const lineHeightRange = document.getElementById('line-height-range');
const lineHeightValue = document.getElementById('line-height-value');
const autosaveToggle = document.getElementById('autosave-toggle');

// 默认设置
let settings = {
    fontSize: 16,
    lineHeight: 1.5,
    autosave: true,
    theme: 'light'
};

// 加载已保存设置（若存在）
function loadSettings() {
    try {
        // 使用localStorage存储设置，如不可用则使用默认值
        const savedSettings = localStorage.getItem('md2txt-settings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }

    // 应用设置值到控件
    fontSizeRange.value = settings.fontSize;
    fontSizeValue.textContent = `${settings.fontSize}px`;
    lineHeightRange.value = settings.lineHeight;
    lineHeightValue.textContent = settings.lineHeight;
    autosaveToggle.checked = settings.autosave;
    
    applySettings();
    
    // 应用主题
    if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 如果有自动保存的内容则加载
    if (settings.autosave) {
        try {
            const savedContent = localStorage.getItem('md2txt-content');
            if (savedContent) {
                markdownEditor.value = savedContent;
            }
        } catch (error) {
            console.error('加载内容失败:', error);
        }
    }
}

// 保存设置
function saveSettings() {
    try {
        localStorage.setItem('md2txt-settings', JSON.stringify(settings));
        console.log('设置已保存');
    } catch (error) {
        console.error('保存设置失败:', error);
        showToast('保存设置失败，可能是隐私模式或存储空间不足', 'error');
    }
}

// 应用设置
function applySettings() {
    markdownEditor.style.fontSize = `${settings.fontSize}px`;
    txtPreview.style.fontSize = `${settings.fontSize}px`;
    markdownEditor.style.lineHeight = settings.lineHeight;
    txtPreview.style.lineHeight = settings.lineHeight;
}

// Markdown 转 TXT 核心功能
function convertMarkdownToTxt(markdown) {
    if (!markdown) return '';
    
    let txt = markdown;
    
    // 处理标题
    txt = txt.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, content) => {
        const level = hashes.length;
        const indent = '  '.repeat(level - 1);
        return `${indent}${content}`;
    });
    
    // 处理粗体和斜体
    txt = txt.replace(/(\*\*|__)(.*?)\1/g, '$2'); // 移除粗体标记
    txt = txt.replace(/(\*|_)(.*?)\1/g, '$2');    // 移除斜体标记
    
    // 处理行内代码
    txt = txt.replace(/`([^`]+)`/g, '$1');
    
    // 处理代码块，保持缩进
    txt = txt.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, (match, code) => {
        return code.split('\n').map(line => `    ${line}`).join('\n');
    });
    
    // 处理有序列表和无序列表
    txt = txt.replace(/^(\s*)([*\-+]|\d+\.)\s+(.*)$/gm, (match, indent, bullet, content) => {
        if (/^\d+\./.test(bullet)) {
            // 有序列表
            return `${indent}${bullet} ${content}`;
        } else {
            // 无序列表
            return `${indent}- ${content}`;
        }
    });
    
    // 处理链接，只保留链接文本
    txt = txt.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    
    // 处理图片，只保留 alt 文本
    txt = txt.replace(/!\[([^\]]+)\]\([^\)]+\)/g, '[图片: $1]');
    
    // 处理水平线
    txt = txt.replace(/^(\s*?)\-{3,}(\s*)$/gm, '----------------------------');
    
    // 移除 HTML 标签
    txt = txt.replace(/<[^>]*>/g, '');
    
    return txt;
}

// 显示通知 - 使用Toastify
function showToast(message, type = 'success', duration = 3000) {
    const bgColors = {
        success: 'linear-gradient(to right, #00b09b, #96c93d)',
        error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        info: 'linear-gradient(to right, #2193b0, #6dd5ed)'
    };
    
    Toastify({
        text: message,
        duration: duration,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: bgColors[type] || bgColors.info,
        }
    }).showToast();
}

// 自动保存功能
let autoSaveTimeout;
function setupAutoSave() {
    if (settings.autosave) {
        markdownEditor.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                try {
                    localStorage.setItem('md2txt-content', markdownEditor.value);
                    console.log('内容已自动保存');
                } catch (error) {
                    console.error('自动保存失败:', error);
                }
            }, 1000);
        });
    }
}

// 更新预览
function updatePreview() {
    const markdown = markdownEditor.value;
    const txt = convertMarkdownToTxt(markdown);
    txtPreview.textContent = txt;
    
    // 如果启用代码高亮，这里可以添加代码高亮的处理
    // hljs.highlightAll();
}

// 同步滚动
function setupSyncScroll() {
    markdownEditor.addEventListener('scroll', () => {
        const percentage = markdownEditor.scrollTop / (markdownEditor.scrollHeight - markdownEditor.clientHeight);
        txtPreview.scrollTop = percentage * (txtPreview.scrollHeight - txtPreview.clientHeight);
    });
}

// 字体大小控制
function setupFontControls() {
    mdFontDecrease.addEventListener('click', () => {
        if (settings.fontSize > 12) {
            settings.fontSize--;
            fontSizeRange.value = settings.fontSize;
            fontSizeValue.textContent = `${settings.fontSize}px`;
            applySettings();
            saveSettings();
        }
    });
    
    mdFontIncrease.addEventListener('click', () => {
        if (settings.fontSize < 24) {
            settings.fontSize++;
            fontSizeRange.value = settings.fontSize;
            fontSizeValue.textContent = `${settings.fontSize}px`;
            applySettings();
            saveSettings();
        }
    });
    
    txtFontDecrease.addEventListener('click', () => {
        if (settings.fontSize > 12) {
            settings.fontSize--;
            fontSizeRange.value = settings.fontSize;
            fontSizeValue.textContent = `${settings.fontSize}px`;
            applySettings();
            saveSettings();
        }
    });
    
    txtFontIncrease.addEventListener('click', () => {
        if (settings.fontSize < 24) {
            settings.fontSize++;
            fontSizeRange.value = settings.fontSize;
            fontSizeValue.textContent = `${settings.fontSize}px`;
            applySettings();
            saveSettings();
        }
    });
}

// 导入文件
function setupFileImport() {
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            markdownEditor.value = event.target.result;
            updatePreview();
            if (settings.autosave) {
                try {
                    localStorage.setItem('md2txt-content', markdownEditor.value);
                } catch (error) {
                    console.error('保存导入内容失败:', error);
                }
            }
            showToast(`已导入: ${file.name}`, 'success');
        };
        reader.readAsText(file);
    });
}

// 清空内容
function setupClearButton() {
    clearBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有内容吗？')) {
            markdownEditor.value = '';
            updatePreview();
            if (settings.autosave) {
                try {
                    localStorage.setItem('md2txt-content', '');
                } catch (error) {
                    console.error('清空内容保存失败:', error);
                }
            }
            showToast('内容已清空', 'info');
        }
    });
}

// 复制TXT
function setupCopyButton() {
    copyBtn.addEventListener('click', () => {
        const txt = txtPreview.textContent;
        navigator.clipboard.writeText(txt).then(() => {
            showToast('TXT内容已复制到剪贴板', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            showToast('复制失败，请尝试手动复制', 'error');
        });
    });
}

// 下载TXT
function setupDownloadButton() {
    downloadBtn.addEventListener('click', () => {
        const txt = txtPreview.textContent;
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `markdown2txt_${new Date().toISOString().slice(0, 10)}.txt`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`已下载 ${fileName}`, 'success');
    });
}

// 设置面板
function setupSettingsPanel() {
    settingsBtn.addEventListener('click', () => {
        settingsContainer.style.display = 'flex';
    });
    
    closeSettings.addEventListener('click', () => {
        settingsContainer.style.display = 'none';
    });
    
    settingsContainer.addEventListener('click', (e) => {
        if (e.target === settingsContainer) {
            settingsContainer.style.display = 'none';
        }
    });
    
    fontSizeRange.addEventListener('input', () => {
        settings.fontSize = parseInt(fontSizeRange.value);
        fontSizeValue.textContent = `${settings.fontSize}px`;
        applySettings();
    });
    
    fontSizeRange.addEventListener('change', () => {
        saveSettings();
    });
    
    lineHeightRange.addEventListener('input', () => {
        settings.lineHeight = parseFloat(lineHeightRange.value);
        lineHeightValue.textContent = settings.lineHeight;
        applySettings();
    });
    
    lineHeightRange.addEventListener('change', () => {
        saveSettings();
    });
    
    autosaveToggle.addEventListener('change', () => {
        settings.autosave = autosaveToggle.checked;
        saveSettings();
        // 如果禁用自动保存，清除相关数据
        if (!settings.autosave) {
            try {
                localStorage.removeItem('md2txt-content');
            } catch (error) {
                console.error('清除自动保存内容失败:', error);
            }
        }
    });
}

// 主题切换
function setupThemeToggle() {
    themeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            settings.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            settings.theme = 'dark';
        }
        saveSettings();
    });
}

// 防止意外关闭
function setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
        // 如果有未保存内容且启用了自动保存
        if (markdownEditor.value && settings.autosave) {
            try {
                localStorage.setItem('md2txt-content', markdownEditor.value);
            } catch (error) {
                console.error('离开前保存失败:', error);
            }
        }
        
        // 如果内容非空且与未保存内容不同
        if (markdownEditor.value && !settings.autosave) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
}

// 键盘快捷键
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S: 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            try {
                localStorage.setItem('md2txt-content', markdownEditor.value);
                showToast('内容已保存', 'success');
            } catch (error) {
                console.error('保存失败:', error);
                showToast('保存失败', 'error');
            }
        }
        
        // Ctrl+D: 下载
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            downloadBtn.click();
        }
        
        // Ctrl+Shift+C: 复制TXT
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyBtn.click();
        }
        
        // Escape: 关闭设置面板
        if (e.key === 'Escape' && settingsContainer.style.display === 'flex') {
            settingsContainer.style.display = 'none';
        }
    });
}

// 亮点：代码高亮 (如果需要)
function setupSyntaxHighlight() {
    if (typeof hljs !== 'undefined') {
        markdownEditor.addEventListener('input', () => {
            // 可以在这里添加代码片段的高亮逻辑
        });
    }
}

// 初始化
function init() {
    // 优先应用主题设置
    try {
        const savedSettings = localStorage.getItem('md2txt-settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    } catch (error) {
        console.error('加载主题设置失败:', error);
    }

    loadSettings();
    setupAutoSave();
    updatePreview();
    setupSyncScroll();
    setupFontControls();
    setupFileImport();
    setupClearButton();
    setupCopyButton();
    setupDownloadButton();
    setupSettingsPanel();
    setupThemeToggle();
    setupBeforeUnload();
    setupKeyboardShortcuts();
    
    // 监听输入更新预览
    markdownEditor.addEventListener('input', updatePreview);

    // 如果内容为空，添加示例内容
    if (!markdownEditor.value) {
        markdownEditor.value = `# DeepSeek去星号-markdown转txt示例

## 这是二级标题

这是普通段落文本，支持*斜体*和**粗体**。

- 这是无序列表项1
- 这是无序列表项2
  - 这是嵌套列表项

1. 这是有序列表项1
2. 这是有序列表项2

> 这是一段引用文本

\`\`\`javascript
// 这是代码块
function hello() {
    console.log("Hello, World!");
}
\`\`\`

[这是一个链接](https://example.com)

---

表格示例：

| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格1 | 单元格2 | 单元格3 |
| 数据A | 数据B | 数据C |
`;
        updatePreview();
    }
    
    // 首次加载完成提示
    setTimeout(() => {
        showToast('欢迎使用DeepSeek去星号-markdown转txt工具！', 'info');
    }, 500);
}

// 启动应用
document.addEventListener('DOMContentLoaded', init); 