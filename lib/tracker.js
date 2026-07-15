import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export function mountTracker(refs, db) {
  var STATUSES = [
    { key: "idea", label: "Idea", color: "#726A82" },
    { key: "scripting", label: "Scripting", color: "#E58AC0" },
    { key: "filming", label: "Filming", color: "#F0409C" },
    { key: "editing", label: "Editing", color: "#E31C79" },
    { key: "review", label: "Review", color: "#E8A33D" },
    { key: "scheduled", label: "Scheduled", color: "#C4145F" },
    { key: "published", label: "Published", color: "#9A0E4B" },
  ];
  var CONTENT_TYPES = [
    { key: "yt-long", label: "YouTube Long-form" },
    { key: "yt-shorts", label: "YouTube Shorts" },
    { key: "ig-reel", label: "Instagram Reel" },
    { key: "li-video", label: "LinkedIn Video" },
    { key: "ad-creative", label: "Ad Creative" },
    { key: "podcast-clip", label: "Podcast Clip" },
    { key: "webinar-recap", label: "Webinar Recap" },
    { key: "case-study", label: "Case Study Film" },
  ];
  var TASK_TYPES = [
    { key: "scripting", label: "Scripting" },
    { key: "filming", label: "Filming" },
    { key: "editing", label: "Editing" },
    { key: "motion-graphics", label: "Motion Graphics" },
    { key: "voiceover", label: "Voiceover" },
    { key: "thumbnail", label: "Thumbnail Design" },
    { key: "review-qa", label: "Review / QA" },
  ];
  var PRIORITIES = [
    { key: "rock", label: "Rock" },
    { key: "pebble", label: "Pebble" },
  ];
  var COLUMNS = [
    { key: "title", label: "Title" },
    { key: "contentType", label: "Content type" },
    { key: "taskType", label: "Task type" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "deadline", label: "Deadline" },
    { key: "publishDate", label: "Publish date" },
    { key: "links", label: "Links" },
    { key: "assignee", label: "Assigned to" },
  ];
  var PLATFORMS = [
    { key: "youtube", label: "YouTube", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.46-5.3a3 3 0 0 0-2.1-2.1C18.9 4 12 4 12 4s-6.9 0-8.44.6a3 3 0 0 0-2.1 2.1C1 8.4 1 12 1 12s0 3.6.46 5.3a3 3 0 0 0 2.1 2.1C5.1 20 12 20 12 20s6.9 0 8.44-.6a3 3 0 0 0 2.1-2.1C23 15.6 23 12 23 12z"/><path d="M9.75 15.5v-7l6 3.5z" fill="var(--bg-1)"/></svg>' },
    { key: "instagram", label: "Instagram", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>' },
    { key: "linkedin", label: "LinkedIn", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9.5h4V21H3zM9.5 9.5H13v1.57h.05c.5-.9 1.72-1.85 3.54-1.85 3.79 0 4.41 2.4 4.41 5.53V21h-4v-5.24c0-1.25-.02-2.86-1.75-2.86-1.76 0-2.03 1.36-2.03 2.77V21h-4z"/></svg>' },
    { key: "tiktok", label: "TikTok", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.9 3.7 4.5 3.9v3.1c-1.6.1-3-.4-4.5-1.4v6.6c0 3.4-2.4 5.8-5.6 5.8-3.3 0-5.9-2.5-5.9-5.7 0-3.4 2.9-6 6.5-5.6v3.2c-.3-.1-.7-.2-1.1-.2-1.4 0-2.6 1.1-2.6 2.6 0 1.5 1.2 2.6 2.6 2.6 1.5 0 2.8-1.2 2.8-2.9V3z"/></svg>' },
    { key: "x", label: "X", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7.6 8.7L23 21h-6.9l-5.4-6.6L4.4 21H1.3l8.1-9.3L1 3h7l4.9 6z"/></svg>' },
    { key: "website", label: "Website", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></svg>' },
  ];
  var AVATAR_PALETTE = ["#E31C79", "#C4145F", "#F0409C", "#9A0E4B", "#E58AC0", "#B23A73"];
  var PENCIL_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  var CHECK_SVG = '<span class="check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';

  function platformOf(key){ return PLATFORMS.find(function(p){return p.key===key;}) || PLATFORMS[0]; }
  function statusOf(key){ return STATUSES.find(function(s){return s.key===key;}) || STATUSES[0]; }
  function contentTypeOf(key){ return CONTENT_TYPES.find(function(c){return c.key===key;}) || CONTENT_TYPES[0]; }
  function taskTypeOf(key){ return TASK_TYPES.find(function(c){return c.key===key;}) || TASK_TYPES[0]; }
  function priorityOf(key){ return PRIORITIES.find(function(c){return c.key===key;}) || PRIORITIES[0]; }
  function esc(s){ return (s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function colorFor(name){
    var h = 0;
    for (var i=0;i<name.length;i++){ h = name.charCodeAt(i) + ((h<<5)-h); }
    return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
  }
  function initials(name){
    var parts = name.trim().split(/\s+/);
    return ((parts[0]||'')[0]||'').toUpperCase() + ((parts[1]||'')[0]||'').toUpperCase();
  }
  function fmtDate(iso){
    if(!iso) return '';
    var d = new Date(iso+'T00:00:00');
    return d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
  }
  function isOverdue(v){
    if(!v.deadline || v.status==='published') return false;
    var today = new Date(); today.setHours(0,0,0,0);
    return new Date(v.deadline+'T00:00:00') < today;
  }

  var state = { videos: [], team: [], view: 'table', search: '' };

  function applyConfig(cfg){
    if(!cfg) return;
    function apply(list, overrides){
      if(!overrides) return;
      list.forEach(function(item){ if(overrides[item.key]!==undefined) item.label = overrides[item.key]; });
    }
    apply(STATUSES, cfg.statuses);
    apply(PLATFORMS, cfg.platforms);
    apply(CONTENT_TYPES, cfg.contentTypes);
    apply(TASK_TYPES, cfg.taskTypes);
    apply(PRIORITIES, cfg.priorities);
    if(cfg.columns){
      COLUMNS.forEach(function(c){ if(cfg.columns[c.key]!==undefined) c.label = cfg.columns[c.key]; });
    }
  }

  function persistConfig(){
    function toMap(list){ var o={}; list.forEach(function(i){o[i.key]=i.label;}); return o; }
    var colMap = {}; COLUMNS.forEach(function(c){ colMap[c.key]=c.label; });
    setDoc(doc(db, 'config', 'labels'), {
      statuses: toMap(STATUSES), platforms: toMap(PLATFORMS), contentTypes: toMap(CONTENT_TYPES),
      taskTypes: toMap(TASK_TYPES), priorities: toMap(PRIORITIES), columns: colMap
    }, { merge: true }).catch(function(e){ console.error('Failed to save label change', e); });
  }
  function renameLabel(listName, key, newLabel){
    var map = {status:STATUSES, platform:PLATFORMS, contentType:CONTENT_TYPES, taskType:TASK_TYPES, priority:PRIORITIES};
    var list = map[listName];
    if(!list) return;
    var item = list.find(function(i){return i.key===key;});
    if(item) item.label = newLabel;
  }

  function teamMemberOf(id){ return state.team.find(function(t){return t.id===id;}); }

  function getVideo(id){ return state.videos.find(function(v){return v.id===id;}); }

  function updateVideo(id, patch){
    updateDoc(doc(db, 'videos', id), patch).catch(function(e){ console.error('Failed to update video', e); });
  }

  function deleteVideo(id){
    deleteDoc(doc(db, 'videos', id)).catch(function(e){ console.error('Failed to delete video', e); });
  }

  function addVideo(){
    var ref = doc(collection(db, 'videos'));
    setDoc(ref, {
      title: 'Untitled video', contentType: CONTENT_TYPES[0].key, taskType: TASK_TYPES[0].key,
      priority: 'pebble', status: 'idea', deadline: '', publishDate: '', links: [], assigneeId: '',
      createdAt: serverTimestamp()
    }).catch(function(e){ console.error('Failed to add video', e); });
  }

  function renameAssignee(id, name){
    if(!name) return;
    updateDoc(doc(db, 'team', id), { name: name }).catch(function(e){ console.error('Failed to rename person', e); });
  }

  function ensureAssigneeByName(name){
    var existing = state.team.find(function(t){ return t.name === name; });
    if(existing) return existing.id;
    var ref = doc(collection(db, 'team'));
    setDoc(ref, { name: name, color: colorFor(name) }).catch(function(e){ console.error('Failed to add person', e); });
    return ref.id;
  }

  function filteredVideos(){
    var q = state.search.trim().toLowerCase();
    if(!q) return state.videos;
    return state.videos.filter(function(v){
      var ct = contentTypeOf(v.contentType).label.toLowerCase();
      var t = teamMemberOf(v.assigneeId);
      var asg = t ? t.name.toLowerCase() : '';
      return v.title.toLowerCase().indexOf(q)>-1 ||
        ct.indexOf(q)>-1 ||
        asg.indexOf(q)>-1;
    });
  }

  /* ---------------- Rendering ---------------- */

  var root = refs.root;
  var statsRow = refs.statsRow;

  function render(){
    renderStats();
    if(state.view==='table') renderTable();
    else renderBoard();
    updateViewToggle();
  }

  function updateViewToggle(){
    refs.viewTableBtn.classList.toggle('active', state.view==='table');
    refs.viewBoardBtn.classList.toggle('active', state.view==='board');
  }

  function renderStats(){
    var vids = state.videos;
    var total = vids.length;
    var published = vids.filter(function(v){return v.status==='published';}).length;
    var rocks = vids.filter(function(v){return v.priority==='rock';}).length;
    var pebbles = total - rocks;
    var overdue = vids.filter(isOverdue).length;
    statsRow.innerHTML =
      statCard('Total videos', total, false) +
      statCard('Published', published, true) +
      statCard('Rocks', rocks, false) +
      statCard('Pebbles', pebbles, false) +
      statCard('Overdue', overdue, false, overdue>0);
  }
  function statCard(label, value, accent, warn){
    return '<div class="stat-card '+(accent?'accent':'')+(warn?' warn':'')+'">'+
      '<div class="label">'+label+'</div><div class="value">'+value+'</div></div>';
  }

  function renderTable(){
    var vids = filteredVideos();
    if(vids.length===0){ root.innerHTML = emptyState(); return; }
    var rows = vids.map(rowHtml).join('');
    var headCells = COLUMNS.map(function(c){
      return '<th><div class="th-label" contenteditable="true" spellcheck="false" data-col-key="'+c.key+'">'+esc(c.label)+'</div></th>';
    }).join('') + '<th></th>';
    root.innerHTML =
      '<div class="panel"><div class="table-scroll"><table>'+
      '<thead><tr>'+headCells+'</tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  }

  function emptyState(){
    return '<div class="panel"><div class="empty-state">'+
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M21 8l-4 3 4 3z"/></svg>'+
      '<div>No videos yet. Click &ldquo;New video&rdquo; to add one.</div></div></div>';
  }

  function rowHtml(v){
    var over = isOverdue(v);
    return '<tr data-id="'+v.id+'" class="'+(over?'overdue':'')+'">'+
      '<td><div class="title-cell">'+
        '<input class="title-input" data-field="title" value="'+esc(v.title)+'"/>'+
      '</div></td>'+
      '<td class="cell" data-popover="contentType"><span class="chip">'+esc(contentTypeOf(v.contentType).label)+'</span></td>'+
      '<td class="cell" data-popover="taskType"><span class="type-tag">'+esc(taskTypeOf(v.taskType).label)+'</span></td>'+
      '<td class="cell" data-popover="priority">'+priorityChip(v.priority)+'</td>'+
      '<td class="cell" data-popover="status">'+statusChip(v.status)+'</td>'+
      '<td class="cell" data-popover="deadline">'+dateCell(v.deadline, over)+'</td>'+
      '<td class="cell" data-popover="publishDate">'+dateCell(v.publishDate, false)+'</td>'+
      '<td class="cell" data-popover="links">'+linksCell(v)+'</td>'+
      '<td class="cell" data-popover="assignee">'+assigneeCell(v)+'</td>'+
      '<td><button class="row-del" data-action="delete" title="Delete">'+
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>'+
      '</button></td>'+
    '</tr>';
  }

  function priorityChip(key){
    var p = priorityOf(key);
    if(key==='rock'){
      return '<span class="chip priority-rock">'+
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 20h18z"/></svg> '+esc(p.label)+'</span>';
    }
    return '<span class="chip priority-pebble">'+
      '<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg> '+esc(p.label)+'</span>';
  }

  function statusChip(key){
    var s = statusOf(key);
    if(key==='published'){
      return '<span class="chip" style="border-color:'+s.color+';color:'+s.color+'">'+
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="'+s.color+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> '+s.label+'</span>';
    }
    return '<span class="chip"><span class="dot" style="background:'+s.color+'"></span>'+s.label+'</span>';
  }

  function dateCell(iso, over){
    if(!iso) return '<span class="empty-cell">Set date</span>';
    return '<span class="date-pill '+(over?'overdue':'')+'">'+
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+
      fmtDate(iso)+'</span>';
  }

  function linksCell(v){
    var out = '<div class="links-cell">';
    (v.links||[]).forEach(function(l){
      var p = platformOf(l.platform);
      out += '<a class="link-pill" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer" title="'+p.label+'" onclick="event.stopPropagation()">'+p.icon+'</a>';
    });
    out += '<span class="link-add-btn" title="Add link">'+
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>';
    out += '</div>';
    return out;
  }

  function assigneeCell(v){
    var t = teamMemberOf(v.assigneeId);
    if(!t) return '<span class="empty-cell">Unassigned</span>';
    return '<div class="assignee"><div class="avatar" style="background:'+t.color+'">'+initials(t.name)+'</div>'+
      '<span class="assignee-name">'+esc(t.name)+'</span></div>';
  }

  /* ---------------- Board view ---------------- */

  function renderBoard(){
    var vids = filteredVideos();
    var cols = STATUSES.map(function(s){
      var items = vids.filter(function(v){return v.status===s.key;});
      var cards = items.map(cardHtml).join('');
      return '<div class="board-col">'+
        '<div class="board-col-head"><span class="dot" style="background:'+s.color+'"></span><h3>'+s.label+'</h3><span class="count">'+items.length+'</span></div>'+
        '<div class="board-drop" data-status="'+s.key+'">'+cards+'</div>'+
      '</div>';
    }).join('');
    root.innerHTML = '<div class="board">'+cols+'</div>';
  }

  function cardHtml(v){
    var over = isOverdue(v);
    var t = teamMemberOf(v.assigneeId);
    var linksHtml = (v.links||[]).slice(0,3).map(function(l){
      var p = platformOf(l.platform);
      return '<a class="link-pill" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">'+p.icon+'</a>';
    }).join('');
    return '<div class="card '+(over?'overdue':'')+'" draggable="true" data-id="'+v.id+'">'+
      '<div class="card-title">'+esc(v.title)+'</div>'+
      '<div class="card-meta">'+priorityChip(v.priority)+'<span class="type-tag">'+esc(contentTypeOf(v.contentType).label)+'</span></div>'+
      '<div class="card-foot">'+
        (t ? '<div class="avatar" style="background:'+t.color+'" title="'+esc(t.name)+'">'+initials(t.name)+'</div>' : '<span class="empty-cell">Unassigned</span>')+
        (v.deadline ? '<span class="date-pill '+(over?'overdue':'')+'">'+fmtDate(v.deadline)+'</span>' : '')+
      '</div>'+
      (linksHtml ? '<div class="card-links" style="margin-top:8px">'+linksHtml+'</div>' : '')+
    '</div>';
  }

  /* ---------------- Popovers ---------------- */

  var currentPopoverCell = null;
  function closePopover(){
    var existing = document.querySelector('.popover');
    if(existing) existing.remove();
    currentPopoverCell = null;
  }

  function optBtn(o){
    var pencil = '';
    if(o.editList){
      pencil = '<span class="edit-pencil" data-edit-list="'+o.editList+'" data-edit-key="'+o.editKey+'" title="Rename">'+PENCIL_SVG+'</span>';
    } else if(o.editTeam){
      pencil = '<span class="edit-pencil" data-edit-team="'+o.editTeam+'" title="Rename">'+PENCIL_SVG+'</span>';
    }
    return '<button class="opt-btn '+(o.selected?'selected':'')+'" data-set-field="'+o.dataField+'" data-set-value="'+esc(o.value)+'">'+
      (o.iconHtml||'') +
      '<span class="opt-label">'+esc(o.label)+'</span>' +
      (o.selected ? CHECK_SVG : '') +
      pencil +
    '</button>';
  }

  function wireInlineRename(pop){
    pop.querySelectorAll('.edit-pencil').forEach(function(pencil){
      pencil.addEventListener('click', function(e){
        e.stopPropagation();
        var btn = pencil.closest('.opt-btn');
        var labelSpan = btn.querySelector('.opt-label');
        var original = labelSpan.textContent;
        var renameInput = document.createElement('input');
        renameInput.type = 'text';
        renameInput.className = 'rename-input';
        renameInput.value = original;
        labelSpan.replaceWith(renameInput);
        renameInput.focus();
        renameInput.select();
        function commit(){
          var val = renameInput.value.trim() || original;
          if(pencil.hasAttribute('data-edit-team')){
            renameAssignee(pencil.getAttribute('data-edit-team'), val);
          } else {
            renameLabel(pencil.getAttribute('data-edit-list'), pencil.getAttribute('data-edit-key'), val);
            persistConfig();
          }
          render();
        }
        renameInput.addEventListener('click', function(e){ e.stopPropagation(); });
        renameInput.addEventListener('keydown', function(e){
          if(e.key==='Enter'){ e.preventDefault(); renameInput.blur(); }
          else if(e.key==='Escape'){ renameInput.value = original; renameInput.blur(); }
        });
        renameInput.addEventListener('blur', commit);
      });
    });
  }

  function openPopoverFor(cell, field, id){
    closePopover();
    var v = getVideo(id);
    if(!v) return;
    var pop = document.createElement('div');
    pop.className = 'popover' + ((field==='links'||field==='assignee') ? ' wide' : '');
    pop.addEventListener('click', function(e){ e.stopPropagation(); });

    if(field==='contentType' || field==='taskType'){
      var list = field==='contentType' ? CONTENT_TYPES : TASK_TYPES;
      var cur = v[field];
      pop.innerHTML = '<div class="popover-title">'+(field==='contentType'?'Content type':'Task type')+'</div>'+
        list.map(function(opt){
          return optBtn({dataField:field, value:opt.key, selected:opt.key===cur, label:opt.label, editList:field, editKey:opt.key});
        }).join('');
    }
    else if(field==='priority'){
      pop.innerHTML = '<div class="popover-title">Priority</div>'+
        PRIORITIES.map(function(p){
          var icon = p.key==='rock'
            ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 20h18z"/></svg>'
            : '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>';
          return optBtn({dataField:'priority', value:p.key, selected:p.key===v.priority, label:p.label, iconHtml:icon, editList:'priority', editKey:p.key});
        }).join('');
    }
    else if(field==='status'){
      pop.innerHTML = '<div class="popover-title">Status</div>'+
        STATUSES.map(function(s){
          var icon = s.key==='published'
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+s.color+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<span class="dot" style="background:'+s.color+'"></span>';
          return optBtn({dataField:'status', value:s.key, selected:s.key===v.status, label:s.label, iconHtml:icon, editList:'status', editKey:s.key});
        }).join('');
    }
    else if(field==='deadline' || field==='publishDate'){
      pop.innerHTML = '<div class="popover-title">'+(field==='deadline'?'Deadline':'Publish date')+'</div>'+
        '<div style="padding:4px;"><input type="date" class="date-input" style="width:100%" data-set-field="'+field+'" value="'+(v[field]||'')+'"/></div>';
    }
    else if(field==='assignee'){
      pop.innerHTML = '<div class="popover-title">Assigned to</div>'+
        state.team.map(function(t){
          var icon = '<div class="avatar" style="background:'+t.color+'">'+initials(t.name)+'</div>';
          return optBtn({dataField:'assigneeId', value:t.id, selected:t.id===v.assigneeId, label:t.name, iconHtml:icon, editTeam:t.id});
        }).join('') +
        '<div class="person-input-row"><input type="text" placeholder="Add person + Enter" data-new-person="1"/></div>';
    }
    else if(field==='links'){
      pop.innerHTML = '<div class="popover-title">Publishing links</div>'+
        (v.links||[]).map(function(l, idx){
          return '<div class="link-row" data-link-idx="'+idx+'">'+
            '<select data-link-platform>'+PLATFORMS.map(function(p){return '<option value="'+p.key+'" '+(p.key===l.platform?'selected':'')+'>'+p.label+'</option>';}).join('')+'</select>'+
            '<input type="text" placeholder="https://" data-link-url value="'+esc(l.url)+'"/>'+
            '<a class="open" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></a>'+
            '<button class="x" data-remove-link="'+idx+'">'+
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
          '</div>';
        }).join('') +
        '<div class="link-add-row"><button class="add-mini" data-add-link="1">+ add link</button></div>'+
        '<button class="platform-edit-toggle" data-toggle-platforms="1">Edit platform names</button>'+
        '<div class="platform-edit-list">'+
          PLATFORMS.map(function(p){
            return '<div class="platform-edit-row"><span class="icon-box">'+p.icon+'</span><input type="text" data-platform-rename="'+p.key+'" value="'+esc(p.label)+'"/></div>';
          }).join('') +
        '</div>';
    }

    document.body.appendChild(pop);
    currentPopoverCell = cell;
    positionPopover(cell, pop);
    wireInlineRename(pop);

    if(field==='assignee'){
      var input = pop.querySelector('[data-new-person]');
      if(input){
        input.addEventListener('keydown', function(e){
          if(e.key==='Enter' && input.value.trim()){
            var name = input.value.trim();
            var newId = ensureAssigneeByName(name);
            updateVideo(id, { assigneeId: newId });
            closePopover();
          }
        });
      }
    }
    if(field==='links'){
      var toggleBtn = pop.querySelector('[data-toggle-platforms]');
      if(toggleBtn){
        toggleBtn.addEventListener('click', function(e){
          e.stopPropagation();
          pop.querySelector('.platform-edit-list').classList.toggle('open');
        });
      }
      pop.querySelectorAll('[data-platform-rename]').forEach(function(inp){
        inp.addEventListener('click', function(e){ e.stopPropagation(); });
        inp.addEventListener('keydown', function(e){
          if(e.key==='Enter'){ e.preventDefault(); inp.blur(); }
        });
        inp.addEventListener('blur', function(){
          var key = inp.getAttribute('data-platform-rename');
          var val = inp.value.trim();
          if(val){ renameLabel('platform', key, val); persistConfig(); render(); }
        });
      });
      pop.querySelectorAll('[data-link-platform], [data-link-url]').forEach(function(el){
        el.addEventListener('change', syncLinks);
        el.addEventListener('input', syncLinks);
      });
      pop.querySelectorAll('[data-remove-link]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var links = (v.links||[]).slice();
          links.splice(parseInt(btn.getAttribute('data-remove-link'),10), 1);
          updateVideo(id, { links: links });
        });
      });
      var addBtn = pop.querySelector('[data-add-link]');
      if(addBtn){
        addBtn.addEventListener('click', function(){
          var links = (v.links||[]).slice();
          links.push({platform:'website', url:''});
          updateVideo(id, { links: links });
        });
      }
      function syncLinks(){
        var rows = pop.querySelectorAll('.link-row');
        var links = [];
        rows.forEach(function(row){
          links.push({
            platform: row.querySelector('[data-link-platform]').value,
            url: row.querySelector('[data-link-url]').value
          });
        });
        updateVideo(id, { links: links });
      }
    }

    pop.querySelectorAll('[data-set-field]').forEach(function(btn){
      if(btn.tagName==='INPUT'){
        btn.addEventListener('change', function(){
          updateVideo(id, one(btn.getAttribute('data-set-field'), btn.value));
        });
      } else {
        btn.addEventListener('click', function(){
          updateVideo(id, one(btn.getAttribute('data-set-field'), btn.getAttribute('data-set-value')));
          closePopover();
        });
      }
    });
  }

  function one(k,v){ var o={}; o[k]=v; return o; }

  function positionPopover(cell, pop){
    var rect = cell.getBoundingClientRect();
    var top = rect.bottom + 6;
    var left = rect.left;
    if(top + pop.offsetHeight > window.innerHeight - 12){
      top = rect.top - pop.offsetHeight - 6;
    }
    if(left + pop.offsetWidth > window.innerWidth - 12){
      left = Math.max(12, rect.right - pop.offsetWidth);
    }
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  function onDocumentClick(e){
    if(!e.target.closest('.popover') && !e.target.closest('[data-popover]')){
      closePopover();
    }
  }
  document.addEventListener('click', onDocumentClick);

  function onAnyScroll(e){
    if(currentPopoverCell && !e.target.closest('.popover')) closePopover();
  }
  document.addEventListener('scroll', onAnyScroll, true);

  /* ---------------- Event delegation ---------------- */

  function onAddClick(){ addVideo(); }
  function onSearchInput(e){ state.search = e.target.value; render(); }
  function onViewTable(){ state.view='table'; closePopover(); render(); }
  function onViewBoard(){ state.view='board'; closePopover(); render(); }

  refs.addVideoBtn.addEventListener('click', onAddClick);
  refs.searchInput.addEventListener('input', onSearchInput);
  refs.viewTableBtn.addEventListener('click', onViewTable);
  refs.viewBoardBtn.addEventListener('click', onViewBoard);

  function onRootClick(e){
    var delBtn = e.target.closest('[data-action="delete"]');
    if(delBtn){
      var tr = delBtn.closest('tr');
      deleteVideo(tr.getAttribute('data-id'));
      return;
    }
    var cell = e.target.closest('[data-popover]');
    if(cell){
      var already = currentPopoverCell === cell;
      closePopover();
      if(!already){
        var tr2 = cell.closest('tr') || cell.closest('.card');
        var vid = tr2 ? tr2.getAttribute('data-id') : null;
        openPopoverFor(cell, cell.getAttribute('data-popover'), vid);
      }
      return;
    }
  }
  root.addEventListener('click', onRootClick);

  var titleDebounce = {};
  function onRootInput(e){
    if(e.target.matches('[data-field="title"]')){
      var tr = e.target.closest('tr');
      var vid = tr.getAttribute('data-id');
      var val = e.target.value;
      clearTimeout(titleDebounce[vid]);
      titleDebounce[vid] = setTimeout(function(){ updateVideo(vid, { title: val }); }, 350);
    }
  }
  root.addEventListener('input', onRootInput);

  function onRootBlur(e){
    if(e.target.matches('[data-field="title"]')){
      var tr = e.target.closest('tr');
      var vid = tr.getAttribute('data-id');
      clearTimeout(titleDebounce[vid]);
      updateVideo(vid, { title: e.target.value });
    }
    else if(e.target.matches('.th-label')){
      var key = e.target.getAttribute('data-col-key');
      var col = COLUMNS.find(function(c){return c.key===key;});
      if(col){
        col.label = e.target.textContent.trim() || col.label;
        persistConfig();
        e.target.textContent = col.label;
      }
    }
  }
  root.addEventListener('blur', onRootBlur, true);

  function onRootKeydown(e){
    if(e.target.matches('.th-label') && e.key==='Enter'){
      e.preventDefault();
      e.target.blur();
    }
  }
  root.addEventListener('keydown', onRootKeydown);

  /* drag & drop for board */
  var dragId = null;
  function onDragStart(e){
    var card = e.target.closest('.card');
    if(!card) return;
    dragId = card.getAttribute('data-id');
    card.classList.add('dragging');
  }
  function onDragEnd(e){
    var card = e.target.closest('.card');
    if(card) card.classList.remove('dragging');
  }
  function onDragOver(e){
    var drop = e.target.closest('.board-drop');
    if(drop){ e.preventDefault(); drop.classList.add('dragover'); }
  }
  function onDragLeave(e){
    var drop = e.target.closest('.board-drop');
    if(drop) drop.classList.remove('dragover');
  }
  function onDrop(e){
    var drop = e.target.closest('.board-drop');
    if(drop && dragId){
      e.preventDefault();
      drop.classList.remove('dragover');
      updateVideo(dragId, {status: drop.getAttribute('data-status')});
      dragId = null;
    }
  }
  root.addEventListener('dragstart', onDragStart);
  root.addEventListener('dragend', onDragEnd);
  root.addEventListener('dragover', onDragOver);
  root.addEventListener('dragleave', onDragLeave);
  root.addEventListener('drop', onDrop);

  /* ---------------- Firestore subscriptions ---------------- */

  var unsubVideos = onSnapshot(query(collection(db, 'videos'), orderBy('createdAt', 'desc')), function(snap){
    state.videos = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
    render();
  }, function(err){ console.error('videos subscription error', err); });

  var unsubTeam = onSnapshot(collection(db, 'team'), function(snap){
    state.team = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
    render();
  }, function(err){ console.error('team subscription error', err); });

  var unsubConfig = onSnapshot(doc(db, 'config', 'labels'), function(snap){
    applyConfig(snap.exists() ? snap.data() : null);
    render();
  }, function(err){ console.error('config subscription error', err); });

  render();

  return function cleanup(){
    unsubVideos();
    unsubTeam();
    unsubConfig();
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('scroll', onAnyScroll, true);
    refs.addVideoBtn.removeEventListener('click', onAddClick);
    refs.searchInput.removeEventListener('input', onSearchInput);
    refs.viewTableBtn.removeEventListener('click', onViewTable);
    refs.viewBoardBtn.removeEventListener('click', onViewBoard);
    root.removeEventListener('click', onRootClick);
    root.removeEventListener('input', onRootInput);
    root.removeEventListener('blur', onRootBlur, true);
    root.removeEventListener('keydown', onRootKeydown);
    root.removeEventListener('dragstart', onDragStart);
    root.removeEventListener('dragend', onDragEnd);
    root.removeEventListener('dragover', onDragOver);
    root.removeEventListener('dragleave', onDragLeave);
    root.removeEventListener('drop', onDrop);
  };
}
