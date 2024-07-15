// 分离 JS、CSS 和其他资源的函数
function separateJsCss(parts) {
    const js = []; // 存储 JS 资源
    const css = []; // 存储 CSS 资源
    const other = []; // 存储其他资源

    let scriptBuffer = ''; // 用于缓存不完整的 <script> 标签

    // 遍历并分类每个部分
    parts.forEach(part => {
        if (part.startsWith('<script')) {
            // 处理内联 JS
            if (part.endsWith('</script>')) {
                js.push(part);
            } else {
                scriptBuffer += part;
            }
        } else if (part.startsWith('<style')) {
            // 处理内联 CSS
            css.push(part);
        } else if (part.startsWith('<link')) {
            // 处理 link 标签
            css.push(part);
        } else if (part.startsWith('<!--') && part.endsWith('-->')) {
            // 处理注释
            other.push(part);
        } else if (part.startsWith('/*') && part.endsWith('*/')) {
            // 处理 CSS 注释
            css.push(part);
        } else if (part.match(/^\s*\{.*\}\s*$/)) {
            // 处理 CSS 规则
            css.push(part);
        } else if (part.match(/^\s*\(.*\)\s*$/)) {
            // 处理 JS 函数
            js.push(part);
        } else if (part.match(/^\s*\[.*\]\s*$/)) {
            // 处理 JS 数组
            js.push(part);
        } else if (part.match(/^\s*\|.*\|\s*$/)) {
            // 处理 JS 模板字符串
            js.push(part);
        } else if (part.match(/^\s*;.*;\s*$/)) {
            // 处理 JS 语句
            js.push(part);
        } else if (part.match(/^\s*,.*,\s*$/)) {
            // 处理 JS 逗号分隔的值
            js.push(part);
        } else if (part.match(/^\s*:.*:\s*$/)) {
            // 处理 CSS 属性
            css.push(part);
        } else if (part.match(/^\s*\n.*\n\s*$/)) {
            // 处理换行符
            other.push(part);
        } else if (part.match(/^\s*\s.*\s\s*$/)) {
            // 处理空格
            other.push(part);
        } else {
            // 处理其他代码片段
            other.push(part);
        }
    });

    // 检查是否有未完成的 <script> 标签
    if (scriptBuffer) {
        js.push(scriptBuffer);
    }

    // 返回分类后的资源
    return {
        js: js.join(''),
        css: css.join(''),
        other: other.join('')
    };
}