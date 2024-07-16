// i18n.js
const i18n = {
    'zh-cn': {
        'fetching_scripts': '正在获取自定义脚本',
        'error_fetching_scripts': '获取自定义脚本时出错',
        'loaded_scripts': '已加载{loadType}脚本和样式',
        'redirect_mobile': '正在重定向到移动版页面',
        'fetching_ip': '正在获取 IP 地址',
        'error_fetching_ip': '获取 IP 地址时出错',
        'fetching_turnstile_status': '正在获取 Turnstile 状态',
        'error_fetching_turnstile_status': '获取 Turnstile 状态时出错',
        'turnstile_redirect': 'Turnstile 验证失败，正在重定向',
        'showing_iframe': '正在显示 iframe 内容',
        'error_fetching_iframe_favicon': '获取 iframe 或 favicon URL 时出错',
        'setting_title': '设置页面标题',
        'moving_select_to_top': '将选择框移动到顶部',
        'redirect_desktop': '检测到桌面端，正在重定向到桌面版页面',
        'setting_favicon': '设置 favicon',
        'loading': '加载中...',
        'select_site': '选择一个站点...',
        'verification_message': '在继续前，需要验证你是否为人类',
        'noscript_message': '您的浏览器禁用了 JavaScript，请启用 JavaScript 以继续。',
        'title': '404 未找到',
        'message': '您正在寻找的页面不存在。'
    },
    'zh-tw': {
        'fetching_scripts': '正在獲取自定義腳本',
        'error_fetching_scripts': '獲取自定義腳本時出錯',
        'loaded_scripts': '已加載{loadType}腳本和樣式',
        'redirect_mobile': '正在重定向到移動版頁面',
        'fetching_ip': '正在獲取 IP 地址',
        'error_fetching_ip': '獲取 IP 地址時出錯',
        'fetching_turnstile_status': '正在獲取 Turnstile 狀態',
        'error_fetching_turnstile_status': '獲取 Turnstile 狀態時出錯',
        'turnstile_redirect': 'Turnstile 驗證失敗，正在重定向',
        'showing_iframe': '正在顯示 iframe 內容',
        'error_fetching_iframe_favicon': '獲取 iframe 或 favicon URL 時出錯',
        'setting_title': '設置頁面標題',
        'moving_select_to_top': '將選擇框移動到頂部',
        'redirect_desktop': '檢測到桌面端，正在重定向到桌面版頁面',
        'setting_favicon': '設置 favicon',
        'loading': '載入中...',
        'select_site': '選擇一個站點...',
        'verification_message': '在繼續前，需要驗證你是否為人類',
        'noscript_message': '您的瀏覽器禁用了 JavaScript，請啟用 JavaScript 以繼續。',
        'title': '404 未找到',
        'message': '您正在尋找的頁面不存在。'
    },
    'en-us': {
        'fetching_scripts': 'Fetching custom scripts',
        'error_fetching_scripts': 'Error fetching custom scripts',
        'loaded_scripts': 'Loaded {loadType} scripts and styles',
        'redirect_mobile': 'Redirecting to mobile version',
        'fetching_ip': 'Fetching IP address',
        'error_fetching_ip': 'Error fetching IP address',
        'fetching_turnstile_status': 'Fetching Turnstile status',
        'error_fetching_turnstile_status': 'Error fetching Turnstile status',
        'turnstile_redirect': 'Turnstile verification failed, redirecting',
        'showing_iframe': 'Showing iframe content',
        'error_fetching_iframe_favicon': 'Error fetching iframe or favicon URL',
        'setting_title': 'Setting page title',
        'moving_select_to_top': 'Moving select box to top',
        'redirect_desktop': 'Detected desktop device, redirecting to desktop version',
        'setting_favicon': 'Setting favicon',
        'loading': 'Loading...',
        'select_site': 'Select a site...',
        'verification_message': 'Before proceeding, please verify that you are human',
        'noscript_message': 'Your browser has JavaScript disabled, please enable it to continue.',
        'title': '404 Not Found',
        'message': 'The page you are looking for does not exist.'
    },
    'jp': {
        'fetching_scripts': 'カスタムスクリプトを取得中',
        'error_fetching_scripts': 'カスタムスクリプトの取得中にエラーが発生しました',
        'loaded_scripts': '{loadType}スクリプトとスタイルが読み込まれました',
        'redirect_mobile': 'モバイルバージョンにリダイレクト中',
        'fetching_ip': 'IPアドレスを取得中',
        'error_fetching_ip': 'IPアドレスの取得中にエラーが発生しました',
        'fetching_turnstile_status': 'Turnstileのステータスを取得中',
        'error_fetching_turnstile_status': 'Turnstileのステータスの取得中にエラーが発生しました',
        'turnstile_redirect': 'Turnstileの検証に失敗しました、リダイレクト中',
        'showing_iframe': 'iframeの内容を表示中',
        'error_fetching_iframe_favicon': 'iframeまたはfaviconのURLの取得中にエラーが発生しました',
        'setting_title': 'ページタイトルを設定中',
        'moving_select_to_top': '選択ボックスを上部に移動中',
        'redirect_desktop': 'デスクトップデバイスを検出しました、デスクトップバージョンにリダイレクトしています',
        'setting_favicon': 'faviconを設定中',
        'loading': '読み込み中...',
        'select_site': 'サイトを選択...',
        'verification_message': '続行する前に、あなたが人間であることを確認してください',
        'noscript_message': 'あなたのブラウザではJavaScriptが無効になっています。続行するには有効にしてください。',
        'title': '404 見つかりません',
        'message': 'お探しのページは存在しません。'
    },
    'kr': {
        'fetching_scripts': '사용자 정의 스크립트 가져오는 중',
        'error_fetching_scripts': '사용자 정의 스크립트를 가져오는 중 오류 발생',
        'loaded_scripts': '{loadType} 스크립트 및 스타일이 로드되었습니다',
        'redirect_mobile': '모바일 버전으로 리디렉션 중',
        'fetching_ip': 'IP 주소 가져오는 중',
        'error_fetching_ip': 'IP 주소 가져오는 중 오류 발생',
        'fetching_turnstile_status': 'Turnstile 상태 가져오는 중',
        'error_fetching_turnstile_status': 'Turnstile 상태 가져오는 중 오류 발생',
        'turnstile_redirect': 'Turnstile 검증 실패, 리디렉션 중',
        'showing_iframe': 'iframe 내용 표시 중',
        'error_fetching_iframe_favicon': 'iframe 또는 favicon URL 가져오는 중 오류 발생',
        'setting_title': '페이지 제목 설정 중',
        'moving_select_to_top': '선택 상자를 상단으로 이동 중',
        'redirect_desktop': '데스크톱 장치를 감지했습니다, 데스크톱 버전으로 리디렉션 중',
        'setting_favicon': 'favicon 설정 중',
        'loading': '로딩 중...',
        'select_site': '사이트 선택...',
        'verification_message': '계속하기 전에 당신이 인간인지 확인하십시오',
        'noscript_message': '브라우저에서 JavaScript가 비활성화되어 있습니다. 계속하려면 활성화하십시오.',
        'title': '404 찾을 수 없음',
        'message': '당신이 찾고 있는 페이지는 존재하지 않습니다.'
    }
};

function getLocale() {
    const userLang = navigator.language || navigator.userLanguage;
    return i18n[userLang] ? userLang : 'en-us';
}

function translate(key, params = {}) {
    const locale = getLocale();
    let translation = i18n[locale][key] || i18n['en-us'][key];
    if (translation) {
        for (const [param, value] of Object.entries(params)) {
            translation = translation.replace(`{${param}}`, value);
        }
    }
    return translation;
}

export { i18n, getLocale, translate };