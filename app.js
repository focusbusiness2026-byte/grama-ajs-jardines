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
      if ($('#video-dialog').open) $('#video-dialog').close();
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
  const videoDialog = $('#video-dialog');
  document.querySelectorAll('[data-video-open]').forEach(button => {
    button.addEventListener('click', () => {
      const vertical = window.matchMedia('(max-width: 600px)').matches;
      const source = vertical ? avatar.dataset.vertical : avatar.dataset.horizontal;
      videoDialog.classList.toggle('vertical-video', vertical);
      avatar.poster = vertical ? 'assets/alejandro-avatar-vertical.webp' : 'assets/alejandro-avatar-horizontal.webp';
      if (avatar.getAttribute('src') !== source) {
        avatar.src = source;
        avatar.load();
      } else avatar.currentTime = 0;
      avatar.muted = false;
      openDialog(videoDialog);
      avatar.play().catch(() => { /* Los controles permiten iniciar la reproducción. */ });
    });
  });
  videoDialog.addEventListener('close', () => {
    avatar.pause();
    avatar.currentTime = 0;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) avatar.pause();
  });
  updateMessage();
})();
