/* DegreePath UI — intentionally dependency-free and GitHub Pages compatible. */
(function () {
  'use strict';
  var E = window.DegreeEngine;
  var STORE = 'degree-site-v3';
  var VIEWS = ['dashboard', 'courses', 'programs', 'requirements', 'settings'];
  var TITLES = { dashboard: '畢業總覽', courses: '修課紀錄', programs: '學程分析', requirements: '畢業條件', settings: '資料管理' };
  var state = loadState();
  var filters = { query: '', grade: '', program: '', only: false };
  var opened = new Set(['english', 'interest', 'free']);
  var currentView = '';
  var toastTimer = null;
  var main = document.getElementById('appMain');
  function el(id) { return document.getElementById(id); }
  function h(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function cap(value, limit) { return Math.max(0, Math.min(100, Number(value || 0) / limit * 100)); }
  function fmt(value) { return Number(value).toLocaleString('zh-TW', { maximumFractionDigits: 1 }); }
  function uniq(list) { return Array.from(new Set(list)); }
  function loadState() {
    var current = null;
    try { current = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (_) {}
    if (current && current.version === 3) return E.cleanState(current);
    var previous = { electives: [], required: [], interest: [], free: [] };
    try { var codes = JSON.parse(localStorage.getItem('usc112-checked-v1') || '[]'); if (Array.isArray(codes)) previous.electives = codes; } catch (_) {}
    try {
      var extra = JSON.parse(localStorage.getItem('usc112-extra-v2') || '{}');
      if (extra && typeof extra === 'object') {
        previous.required = extra.courses || [];
        previous.interest = extra.interest || [];
        previous.free = extra.free || [];
      }
    } catch (_) {}
    return E.cleanState(previous);
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) { showToast('無法寫入瀏覽器儲存空間，請使用匯出備份。'); } }
  function showToast(message) {
    var toast = el('toast');
    clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
    toastTimer = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function go(view) {
    if (!VIEWS.includes(view)) view = 'dashboard';
    if (location.hash.slice(1) !== view) location.hash = view;
    else render();
  }
  function head(kicker, title, description, action) {
    return '<div class="page-intro"><div><div class="eyebrow">' + h(kicker) + '</div><h1>' + h(title) + '</h1><p>' + h(description) + '</p></div>' + (action || '') + '</div>';
  }
  function progress(value, max) {
    var pct = cap(value, max);
    return '<div class="progress" aria-label="' + fmt(value) + ' / ' + fmt(max) + '"><span class="' + (pct >= 100 ? 'full' : '') + '" style="width:' + pct + '%"></span></div>';
  }
  function statusTag(done, good, pending) { return '<span class="tag ' + (done ? 'good' : 'dark') + '">' + (done ? '✓ ' + good : pending) + '</span>'; }
  function renderDashboard(s) {
    var completed = s.conditions.filter(function (c) { return c.done; }).length;
    var status = s.complete ? '所有網站檢核條件均已達成' : '尚有 ' + (s.conditions.length - completed) + ' 項檢核條件待完成';
    var hero = '<section class="hero"><div><div class="eyebrow on-dark">DEGREE PROGRESS</div><h2>' + (s.complete ? '你的畢業進度已達標' : '離畢業又近了一步') + '</h2><p>這裡會把系必、院必、校必、選修、跨領域課程及學程需求放在同一個地方，不用反覆對照表格。</p><span class="hero-status">● ' + h(status) + '</span></div><div class="hero-progress" style="--pct:' + cap(s.total,128) + '%"><div class="hero-progress-inner"><strong>' + fmt(s.total) + '</strong><span>/ 128 學分</span></div></div></section>';
    var kpis = [
      ['已修總學分', fmt(s.total), '/ 128', '依本站登錄的課程計算'],
      ['系專業選修', fmt(s.system), '學分', s.completedCount + ' 門已勾選'],
      ['完成學程', fmt(s.best.ids.length), '/ 4', '至少需要同時完成 2 個']
    ].map(function (x) { return '<div class="kpi"><div class="kpi-label">' + x[0] + '</div><div class="kpi-value">' + x[1] + ' <span>' + x[2] + '</span></div><div class="kpi-foot">' + x[3] + '</div></div>'; }).join('');
    var conditions = s.conditions.map(function (c) {
      return '<div class="cond-row"><span class="cond-name">' + c.label + (c.done ? ' <span style="color:#198b70">✓</span>' : '') + '</span><span class="cond-value">' + fmt(c.current) + ' / ' + c.target + (c.key === 'programs' ? ' 個' : ' 學分') + '</span>' + progress(c.current, c.target) + '</div>';
    }).join('');
    var programs = E.PROGRAMS.map(function (name, i) {
      var done = s.best.ids.includes(i);
      var potential = s.completedCourses.filter(function (c) { return c.programs.includes(i); }).reduce(function (v, c) { return v + c.credit; }, 0);
      return '<div class="prog-mini ' + (done ? 'done' : '') + '"><div class="prog-index">' + (done ? '✓' : '0' + (i + 1)) + '</div><div class="grow"><b>' + h(name) + '</b><span>已修可用 ' + fmt(potential) + ' 學分（可能與其他學程共用）</span></div>' + statusTag(done, '已完成', '未分配') + '</div>';
    }).join('');
    return head('OVERVIEW', '畢業進度總覽', '112 學年度入學適用 · 依已修及格課程勾選，自動更新進度') + hero +
      '<div class="kpi-grid">' + kpis + '</div><div class="two-col"><section class="card"><div class="card-header"><div><h2>畢業條件檢核</h2><p class="sub">目前已符合 ' + completed + ' / ' + s.conditions.length + ' 項條件</p></div><button class="card-link" type="button" data-open="requirements">查看全部 →</button></div><div class="cond-list">' + conditions + '</div></section>' +
      '<section class="card"><div class="card-header"><div><h2>四學程完成狀況</h2><p class="sub">同一門課只能分配給一個學程</p></div><button class="card-link" type="button" data-open="programs">最佳方案 →</button></div>' + programs + '</section></div>' +
      '<div class="info-banner">提醒：這是依你自行勾選的「已修且及格」紀錄計算，不會自動讀取學校成績。完成網站檢核不等於取得正式畢業資格；新制英文抵認仍須依教務程序辦理。</div>';
  }
  function renderCourseRows() {
    var s = E.summary(state);
    var term = filters.query.trim().toLocaleLowerCase();
    var rows = COURSES.filter(function (c) {
      return (!term || (c.name + c.code).toLocaleLowerCase().includes(term)) &&
        (!filters.grade || c.grade === filters.grade) &&
        (!filters.program || c.programs.includes(Number(filters.program))) &&
        (!filters.only || state.electives.includes(c.code));
    });
    var groups = ['大一', '大二', '大三', '大四'];
    var html = groups.map(function (g) {
      var list = rows.filter(function (c) { return c.grade === g; });
      if (!list.length) return '';
      var items = list.map(function (c) {
        var checked = state.electives.includes(c.code);
        var programs = c.programs.map(function (id) { return E.PROGRAMS[id]; }).join('、') || '不在四學程表內';
        return '<label class="course-row ' + (checked ? 'checked' : '') + '"><input type="checkbox" class="checkbox" data-elective="' + h(c.code) + '" ' + (checked ? 'checked' : '') + ' aria-label="已修過 ' + h(c.name) + '"><span class="course-main"><span class="course-name">' + h(c.name) + '</span><span class="course-meta">' + h(c.code) + ' · ' + h(c.term) + '學期 · ' + h(programs) + '</span></span><span class="course-side"><span class="credit-pill">' + c.credit + ' 學分</span></span></label>';
      }).join('');
      return '<section class="course-group"><div class="course-group-header"><h3>' + g + '</h3><small>' + list.length + ' 門課程</small></div>' + items + '</section>';
    }).join('');
    var results = el('courseResults'), count = el('courseResultsCount');
    if (count) count.textContent = '找到 ' + rows.length + ' 門 · 已修 ' + s.completedCount + ' / ' + COURSES.length + ' 門';
    if (results) results.innerHTML = html || '<div class="empty">目前的篩選條件沒有相符的課程，試試清除搜尋或切換年級。</div>';
  }
  function renderCourses(s) {
    var choices = E.PROGRAMS.map(function (name, i) { return '<option value="' + i + '"' + (filters.program === String(i) ? ' selected' : '') + '>' + h(name) + '</option>'; }).join('');
    var grade = ['大一', '大二', '大三', '大四'].map(function (name) { return '<option value="' + name + '"' + (filters.grade === name ? ' selected' : '') + '>' + name + '</option>'; }).join('');
    return head('COURSES', '我的修課紀錄', '只要勾選已修習及格的系選修，即可即時計算四學程最佳認列') +
      '<div class="filter-panel"><div class="filters"><input class="field" data-filter="query" type="search" placeholder="搜尋課程名稱或代碼…" value="' + h(filters.query) + '" aria-label="搜尋課程"><select class="field" data-filter="grade" aria-label="篩選年級"><option value="">全部年級</option>' + grade + '</select><select class="field" data-filter="program" aria-label="篩選學程"><option value="">全部學程</option>' + choices + '</select><label class="filter-check"><input type="checkbox" class="checkbox" data-filter="only" ' + (filters.only ? 'checked' : '') + '>只看已修</label></div></div>' +
      '<div class="section-head"><h2>系專業選修</h2><span class="tag dark">' + fmt(s.system) + ' 學分已修</span></div><p class="results-label" id="courseResultsCount"></p><div id="courseResults"></div>' +
      '<div class="info-banner">每門課最多認列一個學程。「可用於多個學程」表示有多個候選資格，不代表會被重複計算；實際分配請查看「學程分析」。</div>';
  }
  function renderPrograms(s) {
    var boxes = E.PROGRAMS.map(function (name, i) {
      var used = s.best.ids.includes(i);
      var potential = s.completedCourses.filter(function (c) { return c.programs.includes(i); }).reduce(function (v, c) { return v + c.credit; }, 0);
      return '<article class="program-box ' + (used ? 'complete' : '') + '"><div class="program-box-header"><h3>' + h(name) + '</h3>' + statusTag(used, '最佳方案已達標', '未列入最佳方案') + '</div><div class="program-numbers"><strong>' + (used ? '12' : '0') + '</strong><span>/ 12 學分最佳認列</span></div>' + progress(used ? 12 : 0, 12) + '<p class="small">已修可用 ' + fmt(potential) + ' 學分，但這些課程可能同時符合其他學程，不代表能重複認列。</p></article>';
    }).join('');
    var allocation = s.best.allocation.length ? s.best.allocation.map(function (a) {
      var entries = a.courses.map(function (c) { return '<div class="allocated-row"><span>' + h(c.name) + '</span><small>' + h(c.code) + ' · ' + c.credit + ' 學分</small></div>'; }).join('');
      return '<article class="allocation"><h3>✓ ' + h(E.PROGRAMS[a.id]) + '</h3>' + entries + '</article>';
    }).join('') : '<div class="empty" style="grid-column:1/-1">還沒有任何一個能完成 12 學分的學程。<br>先到「修課紀錄」勾選已修過的課程。</div>';
    var usedCodes = new Set(s.best.allocation.flatMap(function (a) { return a.courses.map(function (c) { return c.code; }); }));
    var remaining = s.completedCourses.filter(function (c) { return !usedCodes.has(c.code); });
    return head('PROGRAMS', '四學程最佳認列', '優先找出最多可同時完成的學程，且每門課至多認列一次', '<button type="button" class="btn btn-outline" data-open="courses">編輯已修課程 →</button>') +
      '<div class="callout">' + (s.best.ids.length >= 2 ? '✓ 目前已找到 ' + s.best.ids.length + ' 個可以同時完成的學程，符合「至少兩個學程」的本站檢核條件。' : '目前只能同時完成 ' + s.best.ids.length + ' 個學程；畢業檢核至少需要兩個，每個須達 12 學分。') + '</div>' +
      '<div class="section-head section-gap"><h2>學程一覽</h2><span class="small">已修可用學分可能重疊</span></div><div class="program-grid">' + boxes + '</div>' +
      '<div class="section-head section-gap"><h2>建議不重複認列清單</h2><span class="tag good">最多 ' + s.best.ids.length + ' 個學程</span></div><div class="allocation-grid">' + allocation + '</div>' +
      (remaining.length ? '<div class="info-banner">此外還有 ' + remaining.length + ' 門已修系選修未用於此份學程最佳認列：' + remaining.map(function (c) { return h(c.name); }).join('、') + '。這些課程的學分仍計入選修總學分。</div>' : '') +
      '<p class="small-note section-gap">最佳解先最大化可完成學程數，再優先選用可認列學程較少的課程。這是可行的建議分配，不是學校正式核定結果。112 級學程清單中唯一 2 學分的可認列課程為「物件導向程式設計」；它仍算已修學分，但無法替代完成 12 學分所需的四門 3 學分課程。</p>';
  }
  function reqItem(item, isEnglish) {
    var code = item[0], name = item[1], credit = isEnglish ? 2 : item[2];
    var done = state.required.includes(code);
    return '<label class="req-item ' + (done ? 'done' : '') + '"><input type="checkbox" class="checkbox" data-required="' + h(code) + '" ' + (done ? 'checked' : '') + '><span class="req-item-text">' + h(name) + '</span><small>' + credit + ' 學分</small></label>';
  }
  function reqCard(key, title, subtitle, body, badge) {
    return '<details class="req-card" data-section="' + key + '" ' + (opened.has(key) ? 'open' : '') + '><summary><span><span class="section-title">' + title + '</span><span class="sub">' + subtitle + '</span></span>' + badge + '<span class="chevron">⌄</span></summary><div class="req-body">' + body + '</div></details>';
  }
  function customRows(type, rows) {
    if (!rows.length) return '<div class="empty">還沒有新增課程。點選下方按鈕，填入課程名稱、學分後再勾選通過。</div>';
    return rows.map(function (r, i) {
      var base = ' data-custom="' + type + '" data-index="' + i + '"';
      var name = '<input class="field" type="text" maxlength="100" placeholder="課程名稱" value="' + h(r.name) + '"' + base + ' data-f="name" aria-label="課程名稱">';
      var field = type === 'interest' ? '<select class="field"' + base + ' data-f="field" aria-label="領域">' + INTEREST_FIELDS.map(function (name) { return '<option' + (r.field === name ? ' selected' : '') + '>' + h(name) + '</option>'; }).join('') + '</select>' : '';
      var credits = '<input class="field" type="number" min="0" max="20" step="0.5" value="' + h(r.credit) + '"' + base + ' data-f="credit" aria-label="學分">';
      var done = '<label class="check-label"><input class="checkbox" type="checkbox"' + base + ' data-f="done"' + (r.done ? ' checked' : '') + '>通過</label>';
      var remove = '<button type="button" class="icon-button" data-remove="' + type + '" data-index="' + i + '" aria-label="刪除這門課">×</button>';
      return '<div class="custom-row ' + (type === 'free' ? 'free' : '') + '">' + name + field + credits + done + remove + '</div>';
    }).join('');
  }
  function renderRequirements(s) {
    var schoolOrdinary = REQUIRED['校訂必修'].filter(function (r) { return !ENGLISH.some(function (eng) { return eng[0] === r[0]; }); });
    var groups = [
      ['school', '校訂必修（不含英文）', schoolOrdinary, 10],
      ['college', '院訂必修', REQUIRED['院訂必修'], 8],
      ['department', '系訂必修', REQUIRED['系訂必修'], 51]
    ];
    var reqs = groups.map(function (g) {
      var earned = g[2].filter(function (x) { return state.required.includes(x[0]); }).reduce(function (a, x) { return a + x[2]; }, 0);
      return reqCard(g[0], g[1], '依 112 級課程表勾選修習及格的科目', g[2].map(function (x) { return reqItem(x, false); }).join(''), '<span class="tag ' + (earned >= g[3] ? 'good' : '') + '">' + earned + ' / ' + g[3] + ' 學分</span>');
    }).join('');
    var english = reqCard('english', '大學英文｜10 選 4', '大學英文（一）至（四）及六門新制課程混合計算', '<p class="req-desc">十門不同課程中通過任意四門，即完成 8 學分的網站檢核；超過四門不重複計入這組必修。</p>' + ENGLISH.map(function (x) { return reqItem(x, true); }).join('') + '<p class="small-note">114 學年度以前入學，利用新制課程重補修舊制大學英文時，仍應依語言中心公告申辦「不同科目抵換單」。</p>', '<span class="tag ' + (s.english >= 4 ? 'good' : '') + '">' + Math.min(4, s.english) + ' / 4 門</span>');
    var interestStats = '<div class="mini-stat-row"><div class="mini-stat">學分 <strong>' + fmt(s.interest) + ' / 10</strong></div><div class="mini-stat">課程 <strong>' + s.interests.length + ' / 5</strong></div><div class="mini-stat">領域 <strong>' + s.interestFields + ' / 4</strong></div></div>';
    var interest = reqCard('interest', '興趣自選', '至少 5 門、跨 4 領域、10 學分', '<p class="req-desc">自行新增興趣自選課程，勾選已通過的項目。請勿把同一門課又填到自由選修。</p>' + interestStats + '<div class="input-table section-gap">' + customRows('interest', state.interest) + '</div><div class="section-gap"><button class="btn btn-outline btn-sm" type="button" data-add="interest">＋ 新增興趣自選</button></div>', statusTag(s.interest >= 10 && s.interests.length >= 5 && s.interestFields >= 4, '達標', '待完成'));
    var elective = reqCard('free', '自由選修／外系課程', '系選修和自由選修合計至少 41 學分', '<p class="req-desc">系選修 ' + fmt(s.system) + ' 學分，另輸入自由選修 ' + fmt(s.free) + ' 學分；同一門課不要重複登錄。</p><div class="mini-stat-row"><div class="mini-stat">選修合計 <strong>' + fmt(s.elective) + ' / 41</strong></div><div class="mini-stat">系選修 <strong>' + fmt(s.system) + ' / 12</strong></div></div><div class="input-table section-gap">' + customRows('free', state.free) + '</div><div class="section-gap"><button class="btn btn-outline btn-sm" type="button" data-add="free">＋ 新增自由選修</button> <button class="btn btn-subtle btn-sm" type="button" data-open="courses">選修課清單 →</button></div>', statusTag(s.elective >= 41 && s.system >= 12, '達標', '待完成'));
    var status = s.complete ? '網站檢核條件已全部完成' : '目前仍有 ' + s.conditions.filter(function (c) { return !c.done; }).length + ' 項條件未完成';
    return head('REQUIREMENTS', '畢業條件', '校、院、系必修與共同課程分開管理，英文採 10 選 4') +
      '<div class="callout ' + (s.complete ? '' : 'neutral') + '">' + (s.complete ? '✓ ' : '○ ') + h(status) + '。畢業總學分 ' + fmt(s.total) + ' / 128；所有項目仍應以學校正式審查為準。</div>' +
      '<div class="section-head section-gap"><h2>必修課程</h2><span class="small">點選分類展開課程</span></div>' + english + reqs +
      '<div class="section-head section-gap"><h2>選修與跨領域</h2></div>' + interest + elective +
      '<div class="info-banner">原三項能力檢測門檻依本工具適用規則不納入判定，並不影響體育、國文、大學英文等正式必修學分。英文替換與其他特殊抵免以教務系統、語言中心公告及系辦認定為準。</div>';
  }
  function renderSettings(s) {
    return head('DATA & SETTINGS', '資料管理', '你的修課資料儲存在目前瀏覽器，不需要登入，也不會上傳到我們的伺服器') +
      '<div class="settings-grid"><section class="settings-card"><h2>備份與還原</h2><p>下載 JSON 檔案，換手機、換電腦或清除瀏覽器資料前可以先備份。也能匯入上一版網站的 JSON 紀錄。</p><button type="button" class="btn btn-primary" data-action="export">↓ 匯出修課資料</button><button type="button" class="btn btn-outline" data-action="import">↑ 匯入資料</button><input id="importInput" type="file" hidden accept="application/json,.json"><div class="divider"></div><div class="small">已登錄系選修 ' + s.completedCount + ' 門，其他自填課程 ' + (state.interest.length + state.free.length) + ' 筆。</div></section>' +
      '<section class="settings-card"><h2>重設進度</h2><p>清空這個瀏覽器內的修課勾選、自填興趣自選及自由選修紀錄。此操作不能復原，建議先匯出備份。</p><button type="button" class="btn btn-danger" data-action="reset">清除全部紀錄</button><div class="divider"></div><p class="small-note">本站不提供帳號、雲端同步或後端資料庫。若使用無痕模式、不同瀏覽器或清除網站資料，可能失去已勾選的紀錄。</p></section></div>' +
      '<section class="settings-card section-gap"><h2>官方資料來源</h2><ul class="source-links"><li><a target="_blank" rel="noopener noreferrer" href="https://csd.kh.usc.edu.tw/var/file/24/1024/img/347/670507279.pdf">112 學年度課程計畫表 ↗</a> — 系選修、校院系必修與學分架構</li><li><a target="_blank" rel="noopener noreferrer" href="https://csd.kh.usc.edu.tw/var/file/24/1024/img/347/206651566.pdf">四學程檢核表 ↗</a> — 各學程課程及 12 學分要求</li><li><a target="_blank" rel="noopener noreferrer" href="https://lc.kh.usc.edu.tw/p/412-1020-3931.php?Lang=zh-tw">語言中心英文課程公告 ↗</a> — 六門新制大學英文抵認</li><li><a target="_blank" rel="noopener noreferrer" href="https://lc.kh.usc.edu.tw/p/403-1020-279-1.php?Lang=zh-tw">語言中心最新公告 ↗</a> — 英文能力指標等公告</li></ul><div class="divider"></div><p class="small-note">本網站為獨立畢業規劃輔助工具，不是實踐大學官方系統。學程認列、實習與畢業資格、不同科目抵換、必選修異動，均以你的適用學年度與學校正式審核為準。</p></section>';
  }
  function render() {
    var view = location.hash.slice(1);
    if (!VIEWS.includes(view)) view = 'dashboard';
    var s = E.summary(state);
    currentView = view;
    document.title = TITLES[view] + '｜DegreePath';
    el('pageTitle').textContent = TITLES[view];
    document.querySelectorAll('[data-view]').forEach(function (node) {
      var active = node.getAttribute('data-view') === view;
      node.classList.toggle('active', active);
      if (active) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current');
    });
    var pages = { dashboard: renderDashboard, courses: renderCourses, programs: renderPrograms, requirements: renderRequirements, settings: renderSettings };
    main.innerHTML = pages[view](s);
    if (view === 'courses') renderCourseRows();
  }
  function download() {
    var blob = new Blob([JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), electives: state.electives, required: state.required, interest: state.interest, free: state.free }, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'degree-path-112-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 800);
    showToast('已匯出修課資料備份');
  }
  function importData(data) {
    if (!data || typeof data !== 'object') throw new Error('格式錯誤');
    if (Array.isArray(data.checked)) {
      var legacy = data.extra && typeof data.extra === 'object' ? data.extra : {};
      data = { electives: data.checked, required: legacy.courses || [], interest: legacy.interest || [], free: legacy.free || [] };
    } else if (!Array.isArray(data.electives) || !Array.isArray(data.required)) throw new Error('缺少課程資料');
    state = E.cleanState(data); save(); render(); showToast('已成功匯入課程紀錄');
  }
  async function upload(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('備份檔案過大');
      importData(JSON.parse(await file.text()));
    } catch (error) {
      showToast('匯入失敗：請確認是本網站的 JSON 備份檔案');
    }
    event.target.value = '';
  }
  document.querySelectorAll('[data-view]').forEach(function (node) {
    node.addEventListener('click', function () { go(node.getAttribute('data-view')); });
  });
  el('quickExport').addEventListener('click', download);
  window.addEventListener('hashchange', function () { render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  main.addEventListener('click', function (event) {
    var open = event.target.closest('[data-open]');
    if (open) { go(open.getAttribute('data-open')); return; }
    var action = event.target.closest('[data-action]');
    if (action) {
      if (action.dataset.action === 'export') download();
      if (action.dataset.action === 'import') el('importInput').click();
      if (action.dataset.action === 'reset' && confirm('確定清除全部已修課程、必修與自填課程？此操作無法復原。')) {
        state = E.emptyState(); save(); render(); showToast('已重設全部修課紀錄');
      }
      return;
    }
    var add = event.target.closest('[data-add]');
    if (add) {
      var type = add.dataset.add;
      state[type].push(type === 'interest' ? { name: '', field: INTEREST_FIELDS[0], credit: 2, done: false } : { name: '', credit: 2, done: false });
      opened.add(type); save(); render(); return;
    }
    var remove = event.target.closest('[data-remove]');
    if (remove) {
      state[remove.dataset.remove].splice(Number(remove.dataset.index), 1);
      save(); render();
    }
  });
  main.addEventListener('input', function (event) {
    var t = event.target;
    if (t.dataset.filter !== undefined) {
      var key = t.dataset.filter;
      filters[key] = key === 'only' ? t.checked : t.value;
      renderCourseRows();
    }
  });
  main.addEventListener('change', function (event) {
    var t = event.target;
    if (t.dataset.elective) {
      state.electives = t.checked ? uniq(state.electives.concat(t.dataset.elective)) : state.electives.filter(function (x) { return x !== t.dataset.elective; });
    } else if (t.dataset.required) {
      state.required = t.checked ? uniq(state.required.concat(t.dataset.required)) : state.required.filter(function (x) { return x !== t.dataset.required; });
    } else if (t.dataset.custom) {
      var row = state[t.dataset.custom][Number(t.dataset.index)];
      if (!row) return;
      var field = t.dataset.f;
      row[field] = field === 'done' ? t.checked : field === 'credit' ? Math.max(0, Math.min(20, Number(t.value) || 0)) : t.value;
    } else if (t.id === 'importInput') { upload(event); return; } else return;
    save(); render();
  });
  main.addEventListener('toggle', function (event) {
    var details = event.target;
    if (!details.matches('details[data-section]')) return;
    if (details.open) opened.add(details.dataset.section); else opened.delete(details.dataset.section);
  }, true);
  render();
})();