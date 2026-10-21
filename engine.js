/* Degree Site — deterministic planning engine. No account, API or server needed. */
(function (global) {
  'use strict';
  var PROGRAMS = ['互動遊戲設計', '數位 3D 動畫設計', 'AR/VR 體感科技', '遊戲美術設計'];
  var TARGET = { school: 18, college: 8, department: 51, interest: 10, elective: 41, overall: 128, programs: 2 };
  function numeric(value) {
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, 20) : 0;
  }
  function sum(list) { return list.reduce(function (acc, item) { return acc + numeric(item.credit); }, 0); }
  function emptyState() { return { version: 3, electives: [], required: [], interest: [], free: [] }; }
  function cleanState(value) {
    var state = emptyState();
    if (!value || typeof value !== 'object') return state;
    var electiveCodes = new Set(COURSES.map(function (c) { return c.code; }));
    var requiredCodes = new Set(Object.values(REQUIRED).flat().map(function (c) { return c[0]; }).concat(ENGLISH.map(function (c) { return c[0]; })));
    state.electives = Array.isArray(value.electives) ? Array.from(new Set(value.electives.filter(function (x) { return typeof x === 'string' && electiveCodes.has(x); }))) : [];
    state.required = Array.isArray(value.required) ? Array.from(new Set(value.required.filter(function (x) { return typeof x === 'string' && requiredCodes.has(x); }))) : [];
    function rows(list, field) {
      if (!Array.isArray(list)) return [];
      return list.slice(0, 150).filter(function (x) { return x && typeof x === 'object'; }).map(function (x) {
        var obj = { name: String(x.name || '').slice(0, 100), credit: numeric(x.credit), done: x.done === true };
        if (field) obj.field = INTEREST_FIELDS.includes(x.field) ? x.field : INTEREST_FIELDS[0];
        return obj;
      });
    }
    state.interest = rows(value.interest, true);
    state.free = rows(value.free, false);
    return state;
  }
  function optimize(courses, passed) {
    var enrolled = new Set(passed);
    // In this 112-grade dataset the only program-eligible 2-credit elective is CSD201.
    // 3*3+2=11, so four distinct 3-credit courses are necessary for each 12-credit program.
    var eligible = courses.filter(function (c) { return enrolled.has(c.code) && c.credit === 3 && c.programs.length; });
    function match(ids) {
      var choices = eligible.filter(function (c) { return c.programs.some(function (p) { return ids.includes(p); }); });
      var n = choices.length, k = ids.length;
      if (n < 4 * k) return null;
      var source = 0, cBase = 1, pBase = cBase + n, sink = pBase + k;
      var graph = Array.from({ length: sink + 1 }, function () { return []; });
      function edge(u, v, capacity, cost) {
        var forward = { to: v, cap: capacity, cost: cost, rev: graph[v].length };
        var reverse = { to: u, cap: 0, cost: -cost, rev: graph[u].length };
        graph[u].push(forward); graph[v].push(reverse);
      }
      choices.forEach(function (course, i) {
        edge(source, cBase + i, 1, 0);
        ids.forEach(function (id, j) {
          if (course.programs.includes(id)) {
            // Prefer specialized courses when several equally valid assignments exist.
            edge(cBase + i, pBase + j, 1, course.programs.length * 100 + i);
          }
        });
      });
      ids.forEach(function (_, j) { edge(pBase + j, sink, 4, 0); });
      var flow = 0, totalCost = 0;
      while (flow < 4 * k) {
        var dist = Array(sink + 1).fill(Infinity), prevV = Array(sink + 1).fill(-1), prevE = Array(sink + 1).fill(-1), inQueue = Array(sink + 1).fill(false);
        dist[source] = 0;
        var queue = [source], h = 0; inQueue[source] = true;
        while (h < queue.length) {
          var u = queue[h++]; inQueue[u] = false;
          graph[u].forEach(function (e, idx) {
            if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
              dist[e.to] = dist[u] + e.cost; prevV[e.to] = u; prevE[e.to] = idx;
              if (!inQueue[e.to]) { queue.push(e.to); inQueue[e.to] = true; }
            }
          });
        }
        if (prevV[sink] < 0) return null;
        for (var v = sink; v !== source; v = prevV[v]) {
          var f = graph[prevV[v]][prevE[v]];
          f.cap -= 1; graph[v][f.rev].cap += 1;
        }
        flow += 1; totalCost += dist[sink];
      }
      var assigned = ids.map(function (id) { return { id: id, courses: [] }; });
      choices.forEach(function (course, i) {
        ids.forEach(function (_, j) {
          var e = graph[cBase + i].find(function (x) { return x.to === pBase + j; });
          if (e && e.cap === 0) assigned[j].courses.push(course);
        });
      });
      return { allocation: assigned, cost: totalCost, ids: ids };
    }
    var best = { allocation: [], cost: Infinity, ids: [] };
    for (var mask = 1; mask < 16; mask++) {
      var ids = [0, 1, 2, 3].filter(function (id) { return !!(mask & (1 << id)); });
      if (ids.length < best.ids.length) continue;
      var result = match(ids);
      if (result && (result.ids.length > best.ids.length || (result.ids.length === best.ids.length && result.cost < best.cost))) best = result;
    }
    return best;
  }
  function summary(state) {
    var selected = new Set(state.electives), doneRequired = new Set(state.required);
    var completedCourses = COURSES.filter(function (c) { return selected.has(c.code); });
    var schoolOrdinary = REQUIRED['校訂必修'].filter(function (r) { return !ENGLISH.some(function (e) { return e[0] === r[0]; }); });
    var earned = function (courses) { return courses.filter(function (r) { return doneRequired.has(r[0]); }).reduce(function (s, r) { return s + r[2]; }, 0); };
    var englishCount = ENGLISH.filter(function (r) { return doneRequired.has(r[0]); }).length;
    var school = earned(schoolOrdinary) + Math.min(englishCount, 4) * 2;
    var college = earned(REQUIRED['院訂必修']);
    var department = earned(REQUIRED['系訂必修']);
    var interests = state.interest.filter(function (r) { return r.done && r.name.trim(); });
    var interest = sum(interests);
    var interestFields = new Set(interests.map(function (r) { return r.field; })).size;
    var free = sum(state.free.filter(function (r) { return r.done && r.name.trim(); }));
    var system = sum(completedCourses);
    var elective = system + free;
    var total = school + college + department + interest + elective;
    var best = optimize(COURSES, state.electives);
    var conditions = [
      { key: 'school', label: '校訂必修', done: school >= TARGET.school, current: school, target: TARGET.school },
      { key: 'college', label: '院訂必修', done: college >= TARGET.college, current: college, target: TARGET.college },
      { key: 'department', label: '系訂必修', done: department >= TARGET.department, current: department, target: TARGET.department },
      { key: 'interest', label: '興趣自選', done: interest >= 10 && interests.length >= 5 && interestFields >= 4, current: interest, target: TARGET.interest },
      { key: 'elective', label: '選修合計', done: elective >= TARGET.elective && system >= 12, current: elective, target: TARGET.elective },
      { key: 'programs', label: '系內學程', done: best.ids.length >= 2, current: best.ids.length, target: 2 },
      { key: 'overall', label: '畢業總學分', done: total >= TARGET.overall, current: total, target: TARGET.overall }
    ];
    return { completedCourses: completedCourses, completedCount: completedCourses.length, school: school, college: college, department: department, english: englishCount, interests: interests, interest: interest, interestFields: interestFields, free: free, system: system, elective: elective, total: total, best: best, conditions: conditions, complete: conditions.every(function (c) { return c.done; }) };
  }
  global.DegreeEngine = Object.freeze({ PROGRAMS: PROGRAMS, TARGET: TARGET, emptyState: emptyState, cleanState: cleanState, optimize: optimize, summary: summary });
})(window);
