import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  esc, uniqueKey, optBtn, wireInlineRename, wireOptionListActions, positionPopover,
} from "./optionPopover";
import { defaultPlatforms, DEFAULT_PLATFORM_ICON } from "./platforms";

var WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toISODate(d){
  var y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
function addDays(d, n){ var r = new Date(d); r.setDate(r.getDate()+n); return r; }
function addMonths(d, n){ var r = new Date(d); r.setMonth(r.getMonth()+n); return r; }
function startOfWeek(d){ var r = new Date(d); r.setHours(0,0,0,0); r.setDate(r.getDate()-r.getDay()); return r; }
function sameDay(a, b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

export function mountCalendar(refs, db) {
  var FORMATS = [
    { key: "video", label: "Video", color: "#F0409C" },
    { key: "text-post", label: "Text Post", color: "#726A82" },
    { key: "creative", label: "Creative/Image", color: "#E8A33D" },
    { key: "event", label: "Event", color: "#9A0E4B" },
  ];
  var PLATFORMS = defaultPlatforms();
  var FORMAT_COLOR_PALETTE = ["#726A82", "#E58AC0", "#F0409C", "#E31C79", "#E8A33D", "#C4145F", "#9A0E4B", "#B23A73"];

  var state = { items: [], view: 'month', cursorDate: new Date() };

  function listFor(listName){ return {format:FORMATS, platform:PLATFORMS}[listName]; }
  function setListFor(listName, arr){
    if(listName==='format') FORMATS = arr;
    else if(listName==='platform') PLATFORMS = arr;
  }
  function formatOf(key){ return FORMATS.find(function(f){return f.key===key;}) || FORMATS[0]; }
  function platformOf(key){ return PLATFORMS.find(function(p){return p.key===key;}) || PLATFORMS[0]; }

  function applyConfig(cfg){
    if(!cfg) return;
    if(Array.isArray(cfg.formats) && cfg.formats.length) FORMATS = cfg.formats;
    if(Array.isArray(cfg.platforms) && cfg.platforms.length) PLATFORMS = cfg.platforms;
  }
  function persistConfig(){
    setDoc(doc(db, 'config', 'labels'), { formats: FORMATS, platforms: PLATFORMS }, { merge: true })
      .catch(function(e){ console.error('Failed to save option change', e); });
  }
  function renameLabel(listName, key, newLabel){
    var list = listFor(listName);
    if(!list) return;
    var item = list.find(function(i){return i.key===key;});
    if(item) item.label = newLabel;
  }
  function addOption(listName, label){
    var list = listFor(listName);
    if(!list || !label) return;
    var key = uniqueKey(list, label);
    var item = { key: key, label: label };
    if(listName==='format') item.color = FORMAT_COLOR_PALETTE[list.length % FORMAT_COLOR_PALETTE.length];
    if(listName==='platform') item.icon = DEFAULT_PLATFORM_ICON;
    setListFor(listName, list.concat([item]));
    persistConfig();
    render();
  }
  function removeOption(listName, key){
    var list = listFor(listName);
    if(!list || list.length<=1) return;
    setListFor(listName, list.filter(function(i){ return i.key!==key; }));
    persistConfig();
    render();
  }

  function getItem(id){ return state.items.find(function(it){ return it.id===id; }); }
  function addItem(dateStr){
    var ref = doc(collection(db, 'calendarItems'));
    setDoc(ref, {
      title: 'New item', format: FORMATS[0].key, date: dateStr || '', links: [],
      createdAt: serverTimestamp()
    }).catch(function(e){ console.error('Failed to add item', e); });
  }
  function updateItem(id, patch){
    updateDoc(doc(db, 'calendarItems', id), patch).catch(function(e){ console.error('Failed to update item', e); });
  }
  function deleteItem(id){
    deleteDoc(doc(db, 'calendarItems', id)).catch(function(e){ console.error('Failed to delete item', e); });
  }

  /* ---------------- Rendering ---------------- */

  var root = refs.root;
  var sidebarEl = refs.sidebar;

  function captureTitleFocus(){
    var el = document.activeElement;
    if(el && el.matches && el.matches('[data-field="title"]') && (root.contains(el) || sidebarEl.contains(el))){
      var card = el.closest('[data-id]');
      return { id: card.getAttribute('data-id'), value: el.value, selStart: el.selectionStart, selEnd: el.selectionEnd };
    }
    return null;
  }
  function restoreTitleFocus(info){
    if(!info) return;
    var input = document.querySelector('[data-id="'+info.id+'"] [data-field="title"]');
    if(!input) return;
    input.value = info.value;
    input.focus();
    try{ input.setSelectionRange(info.selStart, info.selEnd); }catch(e){}
  }

  function updateToolbarLabel(){
    if(state.view==='month'){
      refs.periodLabel.textContent = MONTH_NAMES[state.cursorDate.getMonth()] + ' ' + state.cursorDate.getFullYear();
    } else {
      var days = weekGridDays(state.cursorDate);
      var start = days[0], end = days[6];
      var sameMonth = start.getMonth()===end.getMonth();
      refs.periodLabel.textContent = MONTH_NAMES[start.getMonth()].slice(0,3)+' '+start.getDate()+' – '+
        (sameMonth?'':MONTH_NAMES[end.getMonth()].slice(0,3)+' ')+end.getDate()+', '+end.getFullYear();
    }
  }
  function updateViewToggle(){
    refs.viewMonthBtn.classList.toggle('active', state.view==='month');
    refs.viewWeekBtn.classList.toggle('active', state.view==='week');
  }

  function monthGridDays(anchor){
    var firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    var lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth()+1, 0);
    var start = startOfWeek(firstOfMonth);
    var end = addDays(startOfWeek(lastOfMonth), 6);
    var days = [];
    var cur = start;
    while(cur <= end){ days.push(cur); cur = addDays(cur, 1); }
    return days;
  }
  function weekGridDays(anchor){
    var start = startOfWeek(anchor);
    var days = [];
    for(var i=0;i<7;i++) days.push(addDays(start, i));
    return days;
  }

  function itemChipHtml(it){
    var f = formatOf(it.format);
    return '<div class="cal-item" draggable="true" data-id="'+it.id+'">'+
      '<input class="cal-item-title" data-field="title" value="'+esc(it.title)+'"/>'+
      '<button class="cal-item-dot" data-popover="item" style="background:'+f.color+'" title="'+esc(f.label)+' — edit"></button>'+
    '</div>';
  }

  function dayCellHtml(d, checkOtherMonth){
    var iso = toISODate(d);
    var items = state.items.filter(function(it){ return it.date===iso; });
    var isToday = sameDay(d, new Date());
    var otherMonth = checkOtherMonth && d.getMonth() !== state.cursorDate.getMonth();
    return '<div class="cal-day '+(isToday?'today':'')+(otherMonth?' other-month':'')+'">'+
      '<div class="cal-day-head"><span class="cal-day-num">'+d.getDate()+'</span>'+
        '<button class="cal-day-add" data-add-date="'+iso+'" title="Add item">'+
          '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'+
        '</button>'+
      '</div>'+
      '<div class="cal-items" data-drop-date="'+iso+'">'+ items.map(itemChipHtml).join('') +'</div>'+
    '</div>';
  }

  function renderGrid(){
    var days = state.view==='month' ? monthGridDays(state.cursorDate) : weekGridDays(state.cursorDate);
    var weekdayRow = state.view==='month'
      ? WEEKDAYS.map(function(w){ return '<div class="cal-weekday">'+w+'</div>'; }).join('')
      : days.map(function(d){ return '<div class="cal-weekday">'+WEEKDAYS[d.getDay()]+' '+d.getDate()+'</div>'; }).join('');
    var cells = days.map(function(d){ return dayCellHtml(d, state.view==='month'); }).join('');
    root.innerHTML = '<div class="calendar-grid '+state.view+'">'+
      '<div class="cal-weekday-row">'+weekdayRow+'</div>'+
      '<div class="cal-grid-body '+state.view+'">'+cells+'</div>'+
    '</div>';
  }

  function renderSidebar(){
    var unscheduled = state.items.filter(function(it){ return !it.date; });
    sidebarEl.innerHTML =
      '<div class="cal-sidebar-head">Unscheduled<span class="count">'+unscheduled.length+'</span></div>'+
      '<div class="cal-sidebar-list" data-drop-date="">'+
        (unscheduled.length ? unscheduled.map(itemChipHtml).join('') : '<div class="empty-cell" style="padding:4px 2px;">Drag items here to unschedule, or add a new one above.</div>')+
      '</div>';
  }

  function render(){
    var focusInfo = captureTitleFocus();
    updateToolbarLabel();
    renderGrid();
    renderSidebar();
    updateViewToggle();
    restoreTitleFocus(focusInfo);
  }

  /* ---------------- Popover ---------------- */

  var currentPopoverAnchor = null;
  function closePopover(){
    var existing = document.querySelector('.popover');
    if(existing) existing.remove();
    currentPopoverAnchor = null;
  }

  var renameHandlers = {
    onRenameOption: function(listName, key, val){ renameLabel(listName, key, val); persistConfig(); render(); },
    onDone: function(){ closePopover(); }
  };
  var optionListHandlers = {
    onAddOption: function(listName, label){ addOption(listName, label); },
    onRemoveOption: function(listName, key){ removeOption(listName, key); },
    onDone: function(){ closePopover(); }
  };

  function linkRowHtml(l, idx){
    return '<div class="link-row" data-link-idx="'+idx+'">'+
      '<select data-link-platform>'+PLATFORMS.map(function(p){return '<option value="'+p.key+'" '+(p.key===l.platform?'selected':'')+'>'+p.label+'</option>';}).join('')+'</select>'+
      '<input type="text" placeholder="https://" data-link-url value="'+esc(l.url)+'"/>'+
      '<a class="open" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></a>'+
      '<button class="x" data-remove-link="'+idx+'">'+
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
    '</div>';
  }

  function openItemPopover(anchorEl, id){
    closePopover();
    var it = getItem(id);
    if(!it) return;
    var pop = document.createElement('div');
    pop.className = 'popover wide';
    pop.addEventListener('click', function(e){ e.stopPropagation(); });

    pop.innerHTML =
      '<div class="popover-title">Format</div>'+
      FORMATS.map(function(f){
        return optBtn({
          dataField:'format', value:f.key, selected:f.key===it.format, label:f.label,
          iconHtml:'<span class="dot" style="background:'+f.color+'"></span>',
          editList:'format', editKey:f.key, removeList:'format', removable:FORMATS.length>1
        });
      }).join('') +
      '<div class="person-input-row"><input type="text" placeholder="Add format + Enter" data-add-option="format"/></div>'+
      '<div class="popover-title" style="margin-top:6px;">Links</div>'+
      (it.links||[]).map(linkRowHtml).join('') +
      '<div class="link-add-row"><button class="add-mini" data-add-link="1">+ add link</button></div>'+
      '<div class="cal-popover-actions">'+
        (it.date ? '<button class="add-mini" data-unschedule="1">Move to backlog</button>' : '')+
        '<button class="add-mini danger" data-delete-item="1">Delete</button>'+
      '</div>';

    document.body.appendChild(pop);
    currentPopoverAnchor = anchorEl;
    positionPopover(anchorEl, pop);
    wireInlineRename(pop, renameHandlers);
    wireOptionListActions(pop, optionListHandlers);

    pop.querySelectorAll('[data-set-field]').forEach(function(btn){
      btn.addEventListener('click', function(){
        updateItem(id, { format: btn.getAttribute('data-set-value') });
        closePopover();
      });
    });
    pop.querySelectorAll('[data-link-platform], [data-link-url]').forEach(function(el){
      el.addEventListener('change', syncLinks);
      el.addEventListener('input', syncLinks);
    });
    pop.querySelectorAll('[data-remove-link]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var links = (it.links||[]).slice();
        links.splice(parseInt(btn.getAttribute('data-remove-link'),10), 1);
        updateItem(id, { links: links });
      });
    });
    var addLinkBtn = pop.querySelector('[data-add-link]');
    if(addLinkBtn){
      addLinkBtn.addEventListener('click', function(){
        var links = (it.links||[]).slice();
        links.push({ platform: 'website', url: '' });
        updateItem(id, { links: links });
      });
    }
    function syncLinks(){
      var links = [];
      pop.querySelectorAll('.link-row').forEach(function(row){
        links.push({ platform: row.querySelector('[data-link-platform]').value, url: row.querySelector('[data-link-url]').value });
      });
      updateItem(id, { links: links });
    }
    var unscheduleBtn = pop.querySelector('[data-unschedule]');
    if(unscheduleBtn){
      unscheduleBtn.addEventListener('click', function(){ updateItem(id, { date: '' }); closePopover(); });
    }
    var deleteBtn = pop.querySelector('[data-delete-item]');
    deleteBtn.addEventListener('click', function(){ deleteItem(id); closePopover(); });
  }

  function onDocumentClick(e){
    if(!e.target.closest('.popover') && !e.target.closest('[data-popover]')){
      closePopover();
    }
  }
  document.addEventListener('click', onDocumentClick);

  function onAnyScroll(e){
    if(currentPopoverAnchor && !e.target.closest('.popover')) closePopover();
  }
  document.addEventListener('scroll', onAnyScroll, true);

  /* ---------------- Event delegation ---------------- */

  function onPrev(){ state.cursorDate = state.view==='month' ? addMonths(state.cursorDate,-1) : addDays(state.cursorDate,-7); render(); }
  function onNext(){ state.cursorDate = state.view==='month' ? addMonths(state.cursorDate,1) : addDays(state.cursorDate,7); render(); }
  function onToday(){ state.cursorDate = new Date(); render(); }
  function onViewMonth(){ state.view = 'month'; render(); }
  function onViewWeek(){ state.view = 'week'; render(); }
  function onAddItemClick(){ addItem(''); }

  refs.prevBtn.addEventListener('click', onPrev);
  refs.nextBtn.addEventListener('click', onNext);
  refs.todayBtn.addEventListener('click', onToday);
  refs.viewMonthBtn.addEventListener('click', onViewMonth);
  refs.viewWeekBtn.addEventListener('click', onViewWeek);
  refs.addItemBtn.addEventListener('click', onAddItemClick);

  function onAreaClick(e){
    var addBtn = e.target.closest('[data-add-date]');
    if(addBtn){ addItem(addBtn.getAttribute('data-add-date')); return; }
    var dot = e.target.closest('[data-popover="item"]');
    if(dot){
      var already = currentPopoverAnchor === dot;
      closePopover();
      if(!already){
        var card = dot.closest('[data-id]');
        openItemPopover(dot, card.getAttribute('data-id'));
      }
      return;
    }
  }
  root.addEventListener('click', onAreaClick);
  sidebarEl.addEventListener('click', onAreaClick);

  function onAreaBlur(e){
    if(e.target.matches('[data-field="title"]')){
      var card = e.target.closest('[data-id]');
      updateItem(card.getAttribute('data-id'), { title: e.target.value });
    }
  }
  root.addEventListener('blur', onAreaBlur, true);
  sidebarEl.addEventListener('blur', onAreaBlur, true);

  function onAreaKeydown(e){
    if(e.target.matches('[data-field="title"]') && e.key==='Enter'){
      e.preventDefault();
      e.target.blur();
    }
  }
  root.addEventListener('keydown', onAreaKeydown);
  sidebarEl.addEventListener('keydown', onAreaKeydown);

  /* drag & drop between days / sidebar */
  var dragId = null;
  function onDragStart(e){
    var card = e.target.closest('.cal-item');
    if(!card) return;
    dragId = card.getAttribute('data-id');
    card.classList.add('dragging');
  }
  function onDragEnd(e){
    var card = e.target.closest('.cal-item');
    if(card) card.classList.remove('dragging');
  }
  function onDragOver(e){
    var drop = e.target.closest('[data-drop-date]');
    if(drop){ e.preventDefault(); drop.classList.add('dragover'); }
  }
  function onDragLeave(e){
    var drop = e.target.closest('[data-drop-date]');
    if(drop) drop.classList.remove('dragover');
  }
  function onDrop(e){
    var drop = e.target.closest('[data-drop-date]');
    if(drop && dragId){
      e.preventDefault();
      drop.classList.remove('dragover');
      updateItem(dragId, { date: drop.getAttribute('data-drop-date') });
      dragId = null;
    }
  }
  document.addEventListener('dragstart', onDragStart);
  document.addEventListener('dragend', onDragEnd);
  document.addEventListener('dragover', onDragOver);
  document.addEventListener('dragleave', onDragLeave);
  document.addEventListener('drop', onDrop);

  /* ---------------- Firestore subscriptions ---------------- */

  var unsubItems = onSnapshot(collection(db, 'calendarItems'), function(snap){
    state.items = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
    render();
  }, function(err){ console.error('calendar items subscription error', err); });

  var unsubConfig = onSnapshot(doc(db, 'config', 'labels'), function(snap){
    applyConfig(snap.exists() ? snap.data() : null);
    render();
  }, function(err){ console.error('calendar config subscription error', err); });

  render();

  return function cleanup(){
    unsubItems();
    unsubConfig();
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('scroll', onAnyScroll, true);
    document.removeEventListener('dragstart', onDragStart);
    document.removeEventListener('dragend', onDragEnd);
    document.removeEventListener('dragover', onDragOver);
    document.removeEventListener('dragleave', onDragLeave);
    document.removeEventListener('drop', onDrop);
    refs.prevBtn.removeEventListener('click', onPrev);
    refs.nextBtn.removeEventListener('click', onNext);
    refs.todayBtn.removeEventListener('click', onToday);
    refs.viewMonthBtn.removeEventListener('click', onViewMonth);
    refs.viewWeekBtn.removeEventListener('click', onViewWeek);
    refs.addItemBtn.removeEventListener('click', onAddItemClick);
    root.removeEventListener('click', onAreaClick);
    sidebarEl.removeEventListener('click', onAreaClick);
    root.removeEventListener('blur', onAreaBlur, true);
    sidebarEl.removeEventListener('blur', onAreaBlur, true);
    root.removeEventListener('keydown', onAreaKeydown);
    sidebarEl.removeEventListener('keydown', onAreaKeydown);
  };
}
