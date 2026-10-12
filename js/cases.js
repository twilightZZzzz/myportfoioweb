/*
  Данные кейсов. Всё ниже — заглушки: замени тексты, цифры и цвета на свои.
  Когда появятся реальные скриншоты, положи их в /img и укажи в поле `cover`
  (например cover: 'img/nord.jpg') — тогда вместо нарисованного постера
  покажется картинка. В `gallery` можно перечислить ещё кадры.
*/
window.CASES = [
  {
    id: 'nord',
    title: 'Nord Coffee',
    tagline: 'Интернет-магазин обжарщика, в котором хочется задержаться',
    client: 'Nord Coffee Roasters',
    year: '2025',
    role: 'UX/UI, арт-дирекшн',
    duration: '10 недель',
    tags: ['E-commerce', 'Брендинг', 'Motion'],
    colors: { bg: '#1c120c', a: '#e8a25c', b: '#f6e6d0', ink: '#f6e6d0' },
    variant: 'coffee',
    task: 'Обжарщик продавал отличный кофе через скучный шаблонный магазин. Покупатели не понимали разницу между сортами, а мобильная конверсия была почти в два раза ниже десктопной.',
    solution: 'Построили магазин вокруг вкуса: каждый сорт получил свою «карту вкуса», свой цвет и короткую историю фермы. Каталог превратился в дегустацию, а оформление заказа сократилось до трёх шагов.',
    results: [
      { v: '+38%', l: 'конверсия в покупку' },
      { v: '×2,1', l: 'выручка с мобильных' },
      { v: '4:12', l: 'среднее время на сайте' }
    ]
  },
  {
    id: 'volna',
    title: 'Volna',
    tagline: 'Финтех без страха: банк, который объясняет, а не пугает',
    client: 'Volna Bank',
    year: '2025',
    role: 'Продуктовый дизайн, дизайн-система',
    duration: '5 месяцев',
    tags: ['Финтех', 'Дизайн-система', 'Web App'],
    colors: { bg: '#0b1630', a: '#5b8cff', b: '#c6ff3d', ink: '#eef2ff' },
    variant: 'fintech',
    task: 'Молодой банк запускал вклады для людей, которые никогда не инвестировали. Нужно было снять тревогу и объяснить сложное простыми словами.',
    solution: 'Сделали интерфейс-собеседник: калькулятор, который показывает будущее деньгами, а не процентами, живые подсказки и дизайн-систему из 140 компонентов для команды из 12 человек.',
    results: [
      { v: '+52%', l: 'открытий вкладов' },
      { v: '−31%', l: 'обращений в поддержку' },
      { v: '140', l: 'компонентов в системе' }
    ]
  },
  {
    id: 'mira',
    title: 'Atelier Mira',
    tagline: 'Сайт ателье, который ощущается как примерка',
    client: 'Atelier Mira',
    year: '2024',
    role: 'Веб-дизайн, motion',
    duration: '6 недель',
    tags: ['Fashion', 'Лендинг', 'Анимация'],
    colors: { bg: '#efe6dc', a: '#9b2c2c', b: '#1b1716', ink: '#1b1716' },
    variant: 'fashion',
    task: 'Ателье шьёт на заказ, но сайт выглядел как визитка из 2012-го. Записей на примерку из интернета почти не было.',
    solution: 'Редакционная вёрстка в духе модного журнала, медленные «тканевые» переходы и запись на примерку в два касания прямо из лукбука.',
    results: [
      { v: '×3', l: 'записей на примерку' },
      { v: 'Awwwards', l: 'Honorable Mention' },
      { v: '68%', l: 'трафика с мобильных' }
    ]
  },
  {
    id: 'orbita',
    title: 'Orbita',
    tagline: 'Аналитика, на которую приятно смотреть каждое утро',
    client: 'Orbita Analytics',
    year: '2024',
    role: 'UX-исследование, UI',
    duration: '4 месяца',
    tags: ['SaaS', 'Дашборд', 'UX'],
    colors: { bg: '#101014', a: '#ff5b2e', b: '#7c6cff', ink: '#f3f0ea' },
    variant: 'saas',
    task: 'Пользователи SaaS-сервиса тонули в графиках: 40 виджетов на главной и никакого ответа на вопрос «что мне делать сегодня?».',
    solution: 'Провели 18 интервью, нашли три ключевых сценария и пересобрали главную вокруг «утреннего брифинга»: три главные цифры, одна рекомендация, остальное — по запросу.',
    results: [
      { v: '+44%', l: 'ежедневных пользователей' },
      { v: '−60%', l: 'времени до первого инсайта' },
      { v: '18', l: 'глубинных интервью' }
    ]
  },
  {
    id: 'pulse',
    title: 'Pulse Fest',
    tagline: 'Сайт фестиваля, который звучит ещё до начала',
    client: 'Pulse Festival',
    year: '2023',
    role: 'Арт-дирекшн, веб-дизайн',
    duration: '8 недель',
    tags: ['Событие', 'Интерактив', 'Айдентика'],
    colors: { bg: '#14001f', a: '#ff3df2', b: '#3dfff2', ink: '#fdf0ff' },
    variant: 'fest',
    task: 'Новому фестивалю электронной музыки нужно было продать 15 000 билетов без известных хедлайнеров в первой волне.',
    solution: 'Сделали сайт-инструмент: визуал пульсирует в ритм выбранного трека, лайнап собирается как плейлист, а билет можно «настроить» под себя.',
    results: [
      { v: 'Sold out', l: 'за 19 дней' },
      { v: '×3', l: 'трафик в первую неделю' },
      { v: '1,2 млн', l: 'охват в соцсетях' }
    ]
  }
];

/* Нарисованный постер кейса — пока нет реальных скриншотов */
window.renderPoster = function (c, big) {
  if (c.cover) {
    return `<div class="poster poster--img${big ? ' poster--big' : ''}"><img src="${c.cover}" alt="${c.title}" loading="lazy"></div>`;
  }
  const v = {
    coffee: `
      <div class="pz pz-sun"></div>
      <div class="pz-win">
        <div class="pz-bar"><i></i><i></i><i></i></div>
        <div class="pz-body">
          <b class="pz-h">Кофе, который<br><em>просыпается</em><br>с тобой</b>
          <span class="pz-btn">Выбрать зёрна →</span>
          <div class="pz-bean"></div>
        </div>
      </div>`,
    fintech: `
      <div class="pz pz-grid"></div>
      <div class="pz-win">
        <div class="pz-bar"><i></i><i></i><i></i></div>
        <div class="pz-body">
          <b class="pz-h">Через год<br>у вас будет</b>
          <b class="pz-num">412 800 ₽</b>
          <svg class="pz-chart" viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 55 C40 50 60 42 90 34 S150 12 200 4" fill="none" stroke="currentColor" stroke-width="3"/></svg>
          <div class="pz-card"></div>
        </div>
      </div>`,
    fashion: `
      <div class="pz pz-arch"></div>
      <div class="pz-win">
        <div class="pz-bar"><i></i><i></i><i></i></div>
        <div class="pz-body">
          <b class="pz-h pz-serif">Mira<br><em>atelier</em></b>
          <span class="pz-small">Коллекция осень / зима</span>
          <div class="pz-look"></div>
        </div>
      </div>`,
    saas: `
      <div class="pz pz-orbit"></div>
      <div class="pz-win">
        <div class="pz-bar"><i></i><i></i><i></i></div>
        <div class="pz-body pz-dash">
          <b class="pz-h">Доброе утро ☀︎</b>
          <div class="pz-kpis"><span>+12%</span><span>3 840</span><span>98,2</span></div>
          <div class="pz-bars"><i style="--h:40%"></i><i style="--h:65%"></i><i style="--h:50%"></i><i style="--h:85%"></i><i style="--h:70%"></i><i style="--h:95%"></i></div>
        </div>
      </div>`,
    fest: `
      <div class="pz pz-rings"><i></i><i></i><i></i><i></i></div>
      <div class="pz-win">
        <div class="pz-bar"><i></i><i></i><i></i></div>
        <div class="pz-body">
          <b class="pz-h pz-wide">PULSE<br>FEST</b>
          <span class="pz-small">12—14 июля · Лайнап как плейлист</span>
          <div class="pz-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </div>`
  }[c.variant] || '';
  const s = `--bg:${c.colors.bg};--a:${c.colors.a};--b:${c.colors.b};--ink:${c.colors.ink}`;
  return `<div class="poster poster--${c.variant}${big ? ' poster--big' : ''}" style="${s}">${v}</div>`;
};
