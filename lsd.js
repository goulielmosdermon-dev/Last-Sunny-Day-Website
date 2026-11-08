(function () {
  function closeMenu() {
    var nav = document.querySelector('.dupe__nav');
    if (!nav) return;
    nav.classList.remove('is-open');
    var button = nav.querySelector('.mobile-menu-toggle');
    if (button) { button.setAttribute('aria-expanded', 'false'); button.textContent = 'Menu'; }
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest('.mobile-menu-toggle');
    if (button) {
      var nav = button.closest('.dupe__nav');
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? 'Close' : 'Menu';
    } else if (event.target.closest('.dupe__nav a') || !event.target.closest('.dupe__nav')) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      var button = document.querySelector('.dupe__nav.is-open .mobile-menu-toggle');
      closeMenu();
      if (button) button.focus();
    }
  });
})();

(function () {
  var wrap = document.getElementById('score');
  var btn = wrap && wrap.querySelector('.score__btn');
  var audio = document.getElementById('score-audio');
  var dir = '/Last%20Sunny%20Day_files/Music/';
  var opener = 'Nocturnal%20%28From%20Diamonds%20and%20Blues%29.mp3';
  var rest = [
    'cuando-vuelva-a-tu-lado.mp3',
    'il-mio-mondo.mp3',
    'le-vent-le-cri.mp3',
    'tha-me-thimithis.mp3',
    'la-mer-romance-andaluza.mp3',
    'las-simples-cosas.mp3',
    'efyges-kai-pires.mp3',
    'ase-me-na-figo.mp3',
    'oneiro-hameno.mp3',
    'funnel-of-love.mp3',
    'now-youre-all-alone.mp3',
    'ive-seen-that-face-before.mp3',
    'sweet-dreams.mp3'
  ];
  var KEY = 'lsd-score';
  var playlist = [];
  var track = 0;
  var persistTimer;

  function shuffle(items) {
    var a = items.slice();
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildQueue() {
    playlist = [opener].concat(shuffle(rest));
    track = 0;
  }

  function load(i) {
    track = i;
    audio.src = dir + playlist[track];
  }

  function persist() {
    if (!audio) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        playing: !audio.paused,
        playlist: playlist,
        track: track,
        time: audio.currentTime || 0
      }));
    } catch (e) {}
  }

  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(function () {
      persistTimer = null;
      persist();
    }, 400);
  }

  function restore() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!saved || !saved.playing || !saved.playlist || !saved.playlist.length) return;
      playlist = saved.playlist;
      track = saved.track || 0;
      load(track);
      var start = saved.time || 0;
      audio.addEventListener('loadedmetadata', function onMeta() {
        audio.removeEventListener('loadedmetadata', onMeta);
        try { audio.currentTime = start; } catch (e) {}
      });
      audio.play().catch(function () {});
    } catch (e) {}
  }

  function bindScore() {
    if (!wrap || !btn || !audio) return;
    if (wrap.getAttribute('data-lsd') === '1') return;
    wrap.setAttribute('data-lsd', '1');

    audio.addEventListener('ended', function () {
      if (track + 1 >= playlist.length) buildQueue();
      else track += 1;
      load(track);
      audio.play().catch(function () {});
    });

    btn.addEventListener('click', function () {
      if (audio.paused) {
        if (!playlist.length) {
          buildQueue();
          load(0);
        }
        audio.play().catch(function () {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      wrap.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Pause soundtrack');
      persist();
    });

    audio.addEventListener('pause', function () {
      wrap.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play soundtrack');
      persist();
    });

    audio.addEventListener('timeupdate', schedulePersist);
    restore();
  }

  function runScripts(doc) {
    Array.prototype.forEach.call(document.querySelectorAll('script[data-page-js]'), function (s) {
      s.remove();
    });
    var list = Array.prototype.slice.call(doc.querySelectorAll('body script'));
    function next(i) {
      if (i >= list.length) return;
      var old = list[i];
      if (old.src && /lsd\.js(\?|$)/.test(old.src)) return next(i + 1);
      if (old.src && /player\.vimeo\.com\/api\/player\.js/.test(old.src) && window.Vimeo) {
        return next(i + 1);
      }
      var s = document.createElement('script');
      s.setAttribute('data-page-js', '1');
      if (old.src) {
        s.src = old.src;
        s.onload = function () { next(i + 1); };
        s.onerror = function () { next(i + 1); };
        document.body.appendChild(s);
      } else {
        s.textContent = old.textContent;
        document.body.appendChild(s);
        next(i + 1);
      }
    }
    next(0);
  }

  var moving = false;

  function go(href, fromPop) {
    if (moving) return;
    moving = true;
    fetch(href, { credentials: 'same-origin' }).then(function (res) {
      return res.text().then(function (text) {
        return { res: res, text: text };
      });
    }).then(function (pack) {
      var html = pack.text.replace(/<head([^>]*)>/i, '<head$1><base href="' + pack.res.url + '">');
      var doc = new DOMParser().parseFromString(html, 'text/html');
      if (!doc.querySelector('.dupe__nav') || !doc.querySelector('main')) {
        window.location.href = href;
        return;
      }
      var newNav = doc.querySelector('.dupe__nav');
      var curNav = document.querySelector('.dupe__nav');
      if (newNav && curNav) curNav.replaceWith(document.importNode(newNav, true));
      var newMain = doc.querySelector('main');
      var curMain = document.querySelector('main');
      if (newMain && curMain) curMain.replaceWith(document.importNode(newMain, true));
      document.title = doc.title;
      if (!fromPop) history.pushState({}, '', pack.res.url);
      window.scrollTo(0, 0);
      runScripts(doc);
    }).catch(function () {
      window.location.href = href;
    }).then(function () {
      moving = false;
    });
  }

  function bindNav() {
    if (window.__lsdNav) return;
    window.__lsdNav = true;
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href]');
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === '/info' || url.pathname === '/info/') return;
      if (url.hash && url.pathname === location.pathname) return;
      e.preventDefault();
      go(url.href, false);
    });
    window.addEventListener('popstate', function () {
      go(location.href, true);
    });
  }

  bindScore();
  bindNav();
})();
