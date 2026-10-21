(function () {
  var wrap = document.getElementById('score');
  if (!wrap) return;
  var btn = wrap.querySelector('.score__btn');
  var audio = document.getElementById('score-audio');
  if (!btn || !audio) return;

  var dir = '../Last%20Sunny%20Day_files/Music/';
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
  var playlist = [];
  var track = 0;

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
  });

  audio.addEventListener('pause', function () {
    wrap.classList.remove('is-playing');
    btn.setAttribute('aria-label', 'Play soundtrack');
  });
})();
