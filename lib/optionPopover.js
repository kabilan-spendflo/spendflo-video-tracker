export const PENCIL_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
export const TRASH_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
export const CHECK_SVG = '<span class="check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';

export function esc(s){ return (s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

export function slugify(s){
  var k = String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  return k || ('opt' + Math.random().toString(36).slice(2,7));
}
export function uniqueKey(list, label){
  var base = slugify(label), key = base, n = 2;
  while(list.some(function(i){ return i.key===key; })){ key = base + '-' + n; n++; }
  return key;
}

export function optBtn(o){
  var pencil = '';
  if(o.editList){
    pencil = '<span class="edit-pencil" data-edit-list="'+o.editList+'" data-edit-key="'+o.editKey+'" title="Rename">'+PENCIL_SVG+'</span>';
  } else if(o.editTeam){
    pencil = '<span class="edit-pencil" data-edit-team="'+o.editTeam+'" title="Rename">'+PENCIL_SVG+'</span>';
  }
  var trash = '';
  if(o.removeList && o.removable){
    trash = '<span class="remove-opt" data-remove-list="'+o.removeList+'" data-remove-key="'+o.editKey+'" title="Remove">'+TRASH_SVG+'</span>';
  }
  var colorSwatch = '';
  if(o.colorList){
    colorSwatch = '<span class="opt-color-swatch" data-color-list="'+o.colorList+'" data-color-key="'+o.editKey+'" data-color="'+esc(o.color||'')+'" style="background:'+esc(o.color||'#888888')+'" title="Change color"></span>';
  }
  return '<button class="opt-btn '+(o.selected?'selected':'')+'" data-set-field="'+o.dataField+'" data-set-value="'+esc(o.value)+'">'+
    (o.iconHtml||'') +
    '<span class="opt-label">'+esc(o.label)+'</span>' +
    (o.selected ? CHECK_SVG : '') +
    colorSwatch + pencil + trash +
  '</button>';
}

// handlers: { onRenameOption(listName, key, newLabel), onRenameTeam(teamId, newLabel), onDone() }
export function wireInlineRename(pop, handlers){
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
          if(handlers.onRenameTeam) handlers.onRenameTeam(pencil.getAttribute('data-edit-team'), val);
        } else {
          handlers.onRenameOption(pencil.getAttribute('data-edit-list'), pencil.getAttribute('data-edit-key'), val);
        }
        if(handlers.onDone) handlers.onDone();
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

// handlers: { onAddOption(listName, label), onRemoveOption(listName, key), onDone() }
export function wireOptionListActions(pop, handlers){
  pop.querySelectorAll('.remove-opt').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      handlers.onRemoveOption(btn.getAttribute('data-remove-list'), btn.getAttribute('data-remove-key'));
      if(handlers.onDone) handlers.onDone();
    });
  });
  pop.querySelectorAll('[data-add-option]').forEach(function(input){
    input.addEventListener('click', function(e){ e.stopPropagation(); });
    input.addEventListener('keydown', function(e){
      if(e.key==='Enter' && input.value.trim()){
        handlers.onAddOption(input.getAttribute('data-add-option'), input.value.trim());
        if(handlers.onDone) handlers.onDone();
      }
    });
  });
}

// handlers: { onColorChange(listName, key, newColor) }
export function wireColorSwatches(pop, handlers){
  pop.querySelectorAll('.opt-color-swatch').forEach(function(swatch){
    swatch.addEventListener('click', function(e){
      e.stopPropagation();
      var input = document.createElement('input');
      input.type = 'color';
      input.value = swatch.getAttribute('data-color') || '#888888';
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.addEventListener('click', function(e){ e.stopPropagation(); });
      input.addEventListener('change', function(e){
        e.stopPropagation();
        handlers.onColorChange(swatch.getAttribute('data-color-list'), swatch.getAttribute('data-color-key'), input.value);
        if(input.parentNode) input.parentNode.removeChild(input);
      });
      input.click();
    });
  });
}

export function positionPopover(cell, pop){
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
