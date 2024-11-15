export default class Coverflow extends HTMLElement {
  offset = 70; // pixels

  rotation = 45; // degrees

  base_zindex = 10;

  max_zindex = 100;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.textContent = this.style();
    this.shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.render();
    this.shadow.appendChild(wrapper);

    this.list = this.shadow.querySelector('ul, ol');
    this.nodes = this.list.querySelectorAll('li');
    this.items = Array.prototype.slice.call(this.nodes);
    this.total = this.items.length;

    this.setup();
  }

  disconnectedCallback() {
    this.events.disconnected();
  }

  setup() {
    this.events.connected();

    this.methods.visible();
    this.methods.size(this.list.offsetWidth);
    this.methods.start();
    this.methods.reflection();
    this.methods.endless();

    this.methods.move();
  }

  style() {
    return `
      :host {
        --bg: #fff;
        --perspective: 700px;

        display: block !important;
        overflow: hidden !important;
        max-width: none !important;
      }

      ul, ol {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        list-style: none;
        padding: 0;
        margin: 0;

        perspective: var(--perspective);
        transform-style: preserve-3d;
      }

      .reflection {
        padding-bottom: calc(var(--size) / 3);
      }

      li {
        position: relative;
        flex-shrink: 0;
        width: var(--size);
        cursor: pointer;

        transform-style: preserve-3d;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
      }

      li::before,
      li::after {
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        height: 100%;
        width: 100%;
        z-index: 10;
        content: "";
      }

      li::before {
        background: linear-gradient(var(--bg) 75%, transparent);
        transform: translate(-50%, -50%) rotate(180deg) translateY(-100%);
        z-index: 11;
      }

      li::after {
        background-image: var(--src);
        background-size: cover;
        opacity: 0.75;
        transform: translate(-50%, -50%) scaleY(-1) translateY(-100%);
      }

      img {
        display: block;
        width: 100%;
      }
    `;
  }

  render() {
    return this.innerHTML;
  }

  methods = {
    visible: () => {
      this.visible = this.getAttribute('visible') ?? 4;

      return this.visible;
    },
    endless: () => {
      this.endless = this.getAttribute('endless') ?? false;

      if (this.endless) {
        const list = this.shadow.querySelector('ul, ol');
        const nodes = list.cloneNode(true);

        list.insertAdjacentHTML('afterbegin', nodes.innerHTML);
        list.insertAdjacentHTML('beforeend', nodes.innerHTML);
      }

      return this.endless;
    },
    reflection: () => {
      this.reflection = this.getAttribute('reflection') ?? false;

      if (this.reflection) {
        this.list.classList.add('reflection');
        this.nodes.forEach(node => {
          node.setAttribute(
            'style',
            `--src: url(${node.querySelector('img').getAttribute('src')})`,
          );
        });
      }

      return this.reflection;
    },
    size: width => {
      let visible = this.visible - 1;

      if (visible < 2) {
        visible = 4;
      }

      this.size = window.parseInt(width / visible, 10);
      this.list.setAttribute('style', `--size: ${this.size}px`);
    },
    start: () => {
      let start = this.getAttribute('start') ?? null;

      if (start) {
        start -= 1;
      }

      if (!start) {
        start = Math.floor(this.total / 2);
      }

      this.index = start;
    },
    move: () => {
      // loop through albums & transform positions.
      this.items.forEach((item, i) => {
        item.addEventListener(
          'transitionstart',
          this.events.transitionstart,
          true,
        );

        item.removeEventListener(
          'transitionend',
          this.events.transitionend,
          true,
        );

        // before.
        if (i < this.index) {
          // item.style.transform = 'translateX(-' + (this.offset * (this.index - i)) + '%) rotateY(' + this.rotation + 'deg)'
          item.style.zIndex = this.base_zindex + i;
        }

        // current.
        if (i === this.index) {
          item.addEventListener(
            'transitionend',
            this.events.transitionend,
            true,
          );

          item.removeEventListener(
            'transitionstart',
            this.events.transitionstart,
            true,
          );

          // item.style.transform = 'rotateY(0deg) translateZ(140px)'
          item.style.zIndex = this.max_zindex;
        }

        // after.
        if (i > this.index) {
          // item.style.transform = 'translateX(' + (this.offset * (i - this.index)) + '%) rotateY(-' + this.rotation + 'deg)'
          item.style.zIndex = this.base_zindex + (this.total - i);
        }
      });
    },

    right: () => {
      if (this.index) {
        this.methods.move((this.index -= 1));
      }
    },

    left: () => {
      if (this.total > this.index + 1) {
        this.methods.move((this.index += 1));
      }
    },
  };

  events = {
    connected: () => {
      this.shadow.addEventListener('touchstart', this.events.click);
      this.shadow.addEventListener('click', this.events.click);
      document.addEventListener('keydown', this.events.keydown);

      this.events.resize();
    },
    disconnected: () => {
      this.shadow.removeEventListener('touchstart');
      this.shadow.removeEventListener('click');
      document.removeEventListener('keydown');

      this.resizeObserver.disconnect();
    },
    resize: () => {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          this.methods.size(entry.target.offsetWidth);
        }
      });

      this.resizeObserver.observe(this.list);
    },
    click: event => {
      const item = event.target.closest('li');

      if (item === null) {
        return;
      }

      if (this.index !== this.items.indexOf(item)) {
        event.preventDefault();
      }

      this.index -= this.index - this.items.indexOf(item);

      if (this.index < 0) {
        this.index = 0;
      }

      this.methods.move();
    },
    transitionstart: event => {
      event.target.classList.remove('current');
    },
    transitionend: event => {
      event.target.classList.add('current');
    },
    keydown: event => {
      if (event.keyCode === 37) {
        this.methods.right();
      }

      if (event.keyCode === 39) {
        this.methods.left();
      }
    },
  };
}

if ('customElements' in window) {
  window.customElements.define('cover-flow', Coverflow);
}
