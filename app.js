(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const themeToggle = $('#theme-toggle');
  function syncThemeLabel() {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
    themeToggle.setAttribute('title', dark ? 'Activar modo claro' : 'Activar modo oscuro');
    $('#theme-label').textContent = dark ? 'Claro' : 'Oscuro';
  }
  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('grama-ajs-theme', theme); } catch (e) {}
    syncThemeLabel();
  });
  syncThemeLabel();
  const contact = $('#contact-dialog');
  const form = $('#contact-form');
  const service = $('#service');
  const variety = $('#variety');
  const needs = $('#needs');
  const zone = $('#zone');
  const send = $('#whatsapp-send');
  const preview = $('#message-preview');
  const message = $('#message-text');
  const GRAMA = 'Venta e instalación de grama';
  let opener;

  function openDialog(dialog) {
    opener = document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function updateMessage() {
    const selected = service.value;
    const grama = selected === GRAMA;
    $('#variety-field').hidden = !grama;
    needs.required = selected === 'Necesito orientación';
    $('#needs-optional').textContent = needs.required ? '(cuéntanos qué necesitas)' : '(opcional)';
    const valid = !!selected && (!needs.required || !!needs.value.trim());
    send.setAttribute('aria-disabled', String(!valid));
    $('#selection-hint').hidden = !!selected;
    preview.hidden = !selected;
    if (!selected) {
      message.textContent = '';
      send.removeAttribute('href');
      return;
    }
    const lines = ['Hola, Alejandro. Me interesa: ' + selected + '.'];
    if (grama && variety.value) lines.push('Tipo de grama: ' + variety.value + '.');
    if (grama && !variety.value) lines.push('Quisiera orientación para elegir la grama.');
    if (zone.value.trim()) lines.push('Zona: ' + zone.value.trim() + '.');
    if (needs.value.trim()) lines.push('Lo que necesito: ' + needs.value.trim());
    message.textContent = lines.join('\n');
    if (valid) send.href = 'https://wa.me/584265111415?text=' + encodeURIComponent(message.textContent);
    else send.removeAttribute('href');
  }

  document.querySelectorAll('[data-contact], [data-service]').forEach(button => {
    button.addEventListener('click', () => {
      form.reset();
      if (button.dataset.service) service.value = button.dataset.service;
      if (button.dataset.variety) variety.value = button.dataset.variety;
      updateMessage();
      openDialog(contact);
      service.focus();
    });
  });
  form.addEventListener('input', updateMessage);
  form.addEventListener('change', updateMessage);
  form.addEventListener('submit', e => { e.preventDefault(); if (form.reportValidity() && send.href) send.click(); });
  send.addEventListener('click', e => {
    if (send.getAttribute('aria-disabled') === 'true' || !form.reportValidity()) {
      e.preventDefault();
      if (!service.value) service.focus();
    }
  });

  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      const r = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (opener) opener.focus();
    });
  });
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    $('#large-image').src = button.dataset.image;
    $('#large-image').alt = button.dataset.title;
    $('#large-caption').textContent = button.dataset.title;
    openDialog($('#image-dialog'));
  }));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let count = 0;
    document.querySelectorAll('.gallery figure').forEach(figure => {
      figure.hidden = button.dataset.filter !== 'todos' && figure.dataset.category !== button.dataset.filter;
      if (!figure.hidden) count++;
    });
    $('#gallery-status').textContent = count + ' trabajos visibles';
  }));
  $('#privacy-open').addEventListener('click', () => openDialog($('#privacy-dialog')));
  const menu = $('.menu-toggle');
  function closeMenu() { $('#nav').classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Abrir menú'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    $('#nav').classList.toggle('open', open);
  });
  $('#nav').querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  $('#year').textContent = new Date().getFullYear();
  const avatar = $('#alejandro-avatar');
  const presenter = $('#presentacion');
  const playPresentation = $('#presenter-play');
  const previewToggle = $('#preview-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let fullPresentation = false;
  function syncPreviewButton() {
    previewToggle.textContent = avatar.paused ? '▶' : 'Ⅱ';
    previewToggle.setAttribute('aria-label', avatar.paused ? 'Reproducir vista previa' : 'Pausar vista previa');
  }
  function playPreview() {
    avatar.play().catch(syncPreviewButton);
  }
  if (reducedMotion.matches) { avatar.autoplay = false; avatar.pause(); }
  else playPreview();
  avatar.addEventListener('play', syncPreviewButton);
  avatar.addEventListener('pause', syncPreviewButton);
  previewToggle.addEventListener('click', () => {
    if (avatar.paused) playPreview();
    else avatar.pause();
  });
  playPresentation.addEventListener('click', () => {
    if (!fullPresentation) {
      fullPresentation = true;
      avatar.pause();
      avatar.src = window.matchMedia('(max-width: 600px)').matches ? avatar.dataset.vertical : avatar.dataset.horizontal;
      avatar.loop = false;
      avatar.autoplay = false;
      avatar.muted = false;
      avatar.controls = true;
      presenter.classList.add('is-playing');
      previewToggle.hidden = true;
      avatar.load();
    } else avatar.currentTime = 0;
    playPresentation.hidden = true;
    avatar.play().catch(() => { playPresentation.hidden = false; });
  });
  avatar.addEventListener('ended', () => {
    if (fullPresentation) {
      playPresentation.querySelector('span:last-child').innerHTML = 'Volver a escuchar<small>La presentación de Alejandro · 17 s</small>';
      playPresentation.hidden = false;
    }
  });
  reducedMotion.addEventListener('change', e => {
    if (e.matches && !fullPresentation) avatar.pause();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) avatar.pause();
    else if (!fullPresentation && !reducedMotion.matches) playPreview();
  });
  syncPreviewButton();
  updateMessage();
})();
