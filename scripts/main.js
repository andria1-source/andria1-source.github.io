/**
 * main.js — site behaviour
 * Builds on the Orbitor template script (Themefisher, MIT): burger menu,
 * Slick sliders and Counter-Up are kept; the rest is new.
 */
(function ($) {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu (from template) ---------- */
  $('.navbar-burger').on('click', function () {
    var open = !$(this).hasClass('is-active');
    $('.navbar-burger').toggleClass('is-active', open).attr('aria-expanded', open);
    $('.navbar-menu').toggleClass('is-active', open);
  });

  /* ---------- nav background on scroll ---------- */
  function navState() { $('.navigation').toggleClass('scrolled', $(window).scrollTop() > 40); }
  $(window).on('scroll', navState); navState();

  /* ---------- active nav item from file name ---------- */
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page.indexOf('journal-') === 0) { page = 'journal.html'; }
  if (page.indexOf('project-') === 0) { page = 'projects.html'; }
  $('.navbar-start .navbar-link').each(function () {
    $(this).closest('.navbar-item').toggleClass('active', ($(this).attr('href') || '').toLowerCase() === page);
  });

  /* ---------- scroll reveal + skill bars ---------- */
  function show(el) {
    el.classList.add('in');
    el.querySelectorAll('[data-level]').forEach(function (b) { b.style.width = b.getAttribute('data-level'); });
  }
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); revealObserver.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else { reveals.forEach(show); }

  /* ---------- counters (Counter-Up plugin from template) ---------- */
  if ($.fn.counterUp) { $('.counter-stat').counterUp({ delay: 12, time: 1400 }); }

  /* ---------- typed headline ---------- */
  var typed = document.querySelector('.typed');
  if (typed) {
    var words = JSON.parse(typed.getAttribute('data-words') || '[]');
    if (!reduceMotion && words.length) {
      var wi = 0, ci = words[0].length, del = true;
      setTimeout(function tick() {
        var word = words[wi];
        ci += del ? -1 : 1;
        typed.textContent = word.slice(0, ci);
        var wait = del ? 40 : 90;
        if (!del && ci === word.length) { del = true; wait = 1800; }
        else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; wait = 300; }
        setTimeout(tick, wait);
      }, 2200);
    }
  }

  /* ---------- 3D tilt on hero illustration ---------- */
  var tiltWrap = document.querySelector('.tilt-wrap');
  if (tiltWrap && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var tilt = tiltWrap.querySelector('.tilt');
    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      var r = tiltWrap.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width;
      var y = (e.clientY - (r.top + r.height / 2)) / r.height;
      tilt.style.transform = 'rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg)';
    });
    document.querySelector('.hero').addEventListener('mouseleave', function () { tilt.style.transform = ''; });
  }

  /* ---------- spotlight glow following the mouse on cards ---------- */
  $(document).on('mousemove', '.glow-card', function (e) {
    var r = this.getBoundingClientRect();
    this.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    this.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* ---------- sliders (Slick from template) ---------- */
  if ($.fn.slick) {
    var gallery = $('.portfolio-gallery');
    gallery.slick({
      slidesToShow: 3, slidesToScroll: 1, infinite: true, arrows: false, dots: false,
      autoplay: !reduceMotion, autoplaySpeed: 4000, pauseOnHover: true,
      responsive: [{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 640, settings: { slidesToShow: 1, dots: true } }]
    });
    $('.slider-prev').on('click', function () { gallery.slick('slickPrev'); });
    $('.slider-next').on('click', function () { gallery.slick('slickNext'); });
    $('.portfolio-single-slider').slick({ infinite: true, arrows: false, dots: true, autoplay: !reduceMotion, autoplaySpeed: 3500, adaptiveHeight: true });
  }

  /* ---------- project filter ---------- */
  $('.filter-bar button').on('click', function () {
    var f = $(this).data('filter');
    $('.filter-bar button').removeClass('active').attr('aria-pressed', 'false');
    $(this).addClass('active').attr('aria-pressed', 'true');
    var cols = $('.project-col');
    cols.addClass('is-fading');
    setTimeout(function () {
      cols.each(function () {
        var match = f === 'all' || String($(this).data('group')).split(' ').indexOf(f) !== -1;
        $(this).removeClass('is-fading fade-in').toggleClass('is-hidden-by-filter', !match);
        if (match) { void this.offsetWidth; $(this).addClass('fade-in'); }
      });
    }, reduceMotion ? 0 : 280);
  });

  /* ---------- project details modal ---------- */
  var modal = document.getElementById('projectModal');
  if (modal) {
    var lastFocus = null;
    var openModal = function (card) {
      lastFocus = document.activeElement;
      var img = modal.querySelector('img');
      img.src = card.querySelector('.thumb img').getAttribute('src');
      img.alt = card.querySelector('h4').textContent + ' preview';
      modal.querySelector('h3').textContent = card.querySelector('h4').textContent;
      modal.querySelector('.tags').innerHTML = card.querySelector('.tags').innerHTML;
      modal.querySelector('.desc').textContent = card.getAttribute('data-long');
      var list = modal.querySelector('ul'); list.innerHTML = '';
      (card.getAttribute('data-points') || '').split('|').forEach(function (p) {
        if (p) { var li = document.createElement('li'); li.textContent = p; list.appendChild(li); }
      });
      var cs = modal.querySelector('.case-link'), href = card.getAttribute('data-case');
      cs.style.display = href ? '' : 'none'; if (href) { cs.setAttribute('href', href); }
      modal.classList.add('open'); document.body.style.overflow = 'hidden';
      modal.querySelector('.x').focus();
    };
    var closeModal = function () {
      modal.classList.remove('open'); document.body.style.overflow = '';
      if (lastFocus) { lastFocus.focus(); }
    };
    $(document).on('click', '.project-card .link-btn', function () { openModal(this.closest('.project-card')); });
    $(modal).on('click', function (e) { if (e.target === modal || $(e.target).closest('.x').length) { closeModal(); } });
    $(document).on('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) { closeModal(); } });
  }

  /* ---------- FAQ accordion ---------- */
  $('.faq-q').on('click', function () {
    var item = $(this).closest('.faq-item'), panel = item.find('.faq-a')[0], open = !item.hasClass('open');
    item.toggleClass('open', open); $(this).attr('aria-expanded', open);
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
  });

  /* ---------- journal search + category filter ---------- */
  var posts = $('.blog-list .blog-item');
  if (posts.length) {
    var cat = 'all';
    var applyFilter = function () {
      var q = ($('#postSearch').val() || '').toLowerCase().trim(), shown = 0;
      posts.each(function () {
        var ok = (cat === 'all' || $(this).data('cat') === cat) && $(this).text().toLowerCase().indexOf(q) !== -1;
        $(this).toggle(ok); if (ok) { shown++; }
      });
      $('.no-results').toggle(shown === 0);
    };
    $('#postSearch').on('input', applyFilter);
    $('.cat-list button').on('click', function () {
      cat = $(this).data('cat'); $('.cat-list button').removeClass('active'); $(this).addClass('active'); applyFilter();
    });
  }

  /* ---------- contact form (replaces template's PHP/AJAX form) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please tell me your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email address doesn’t look right.'; },
      topic: function (v) { return v ? '' : 'Please choose a topic.'; },
      message: function (v) { return v.trim().length >= 20 ? '' : 'Please write at least 20 characters.'; }
    };
    var check = function (f) {
      if (!rules[f.name]) { return true; }
      var msg = rules[f.name](f.value);
      f.classList.toggle('is-bad', !!msg);
      var out = document.getElementById(f.name + 'Msg'); if (out) { out.textContent = msg; }
      return !msg;
    };
    $(form).find('input, select, textarea').on('blur change', function () { check(this); })
      .on('input', function () { if (this.classList.contains('is-bad')) { check(this); } });
    var counter = document.getElementById('charCount');
    $('#message').on('input', function () { counter.textContent = this.value.length + ' / 1000'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $(form).find('input, select, textarea').each(function () { ok = check(this) && ok; });
      var status = document.getElementById('formStatus');
      if (!ok) { status.classList.remove('show'); form.querySelector('.is-bad').focus(); return; }
      status.textContent = 'Thanks, ' + form.name.value.trim().split(' ')[0] + '! Your message has been checked and is ready. This site has no mail server, so please also send it to the email address on this page.';
      status.classList.add('show');
      form.reset(); counter.textContent = '0 / 1000';
    });
  }

  /* ---------- back to top ---------- */
  var toTop = $('<button class="to-top" type="button" aria-label="Back to top"><i class="ti-arrow-up"></i></button>').appendTo('body');
  $(window).on('scroll', function () { toTop.toggleClass('show', $(window).scrollTop() > 600); });
  toTop.on('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- reading progress ---------- */
  var bar = document.querySelector('.read-progress');
  if (bar) {
    $(window).on('scroll', function () {
      var h = document.documentElement;
      bar.style.width = (h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1) * 100).toFixed(1) + '%';
    });
  }


  /* ---------- smooth page transitions ----------
     Browsers with cross-document View Transitions animate natively (see custom.css).
     Others get a short curtain fade-out before leaving and a fade-in on arrival. */
  var nativeVT = 'onpagereveal' in window && window.CSS && CSS.supports('view-transition-name: a');
  if (!nativeVT && !reduceMotion) {
    document.body.classList.add('no-vt');
    var curtain = $('<div class="page-curtain" aria-hidden="true"></div>').appendTo('body');
    $(document).on('click', 'a[href]', function (e) {
      var href = this.getAttribute('href');
      if (!href || href.charAt(0) === '#' || this.target === '_blank' || /^(mailto:|tel:|https?:)/.test(href) ||
          e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) { return; }
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = href; }, 330);
    });
    $(window).on('pageshow', function () { document.body.classList.remove('is-leaving'); });
  }

  /* ---------- prefetch pages on hover so they open instantly ---------- */
  var prefetched = {};
  $(document).on('mouseenter touchstart', 'a[href$=".html"]', function () {
    var href = this.getAttribute('href');
    if (prefetched[href] || /^https?:/.test(href)) { return; }
    prefetched[href] = true;
    $('<link rel="prefetch">').attr('href', href).appendTo('head');
  });

  /* ---------- images fade in when loaded ---------- */
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete) { return; }
    img.classList.add('loading-fade');
    img.addEventListener('load', function () { img.classList.remove('loading-fade'); }, { once: true });
  });

  /* ---------- smooth wheel scrolling (mouse wheels only; trackpads keep native feel) ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var target = window.scrollY, current = window.scrollY, ticking = false;
    var loop = function () {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.5) { current = target; ticking = false; }
      window.scrollTo({ top: current, behavior: 'instant' });
      if (ticking) { requestAnimationFrame(loop); }
    };
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.deltaMode !== 0 && e.deltaMode !== 1) { return; }
      var d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      if (Math.abs(d) < 50 || $(e.target).closest('.pmodal, textarea, select').length) { return; } // trackpad or inner scroller
      e.preventDefault();
      if (!ticking) { target = current = window.scrollY; }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target + d));
      if (!ticking) { ticking = true; requestAnimationFrame(loop); }
    }, { passive: false });
    window.addEventListener('scroll', function () { if (!ticking) { target = current = window.scrollY; } }, { passive: true });
  }

  $('.year').text(new Date().getFullYear());
})(jQuery);
