import { html, LitElement } from '@polymer/lit-element';

export class UnderlineInput extends LitElement {
  static get is() { return 'underline-input'; }
  render() {
    return html`
      <style>

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"] {
            font-size: 16px;
            line-height: 2rem;
            border: 0;
            background: none;
            outline: none;
            width: 100%;
        }

        :host .underline::before {
          background-color: lightgray;
        }

        :host .underline::after {
          background-color: darkcyan;
        }

        :host([error]) .underline::after,
        :host([error]) .underline::before {
          background-color: #d32f2f;
        }

        .underline {
          display: inline-block;
          position: relative;
          width: inherit;
        }

        .underline::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0;
        }

        .underline::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          transform-origin: bottom right;
          transition: transform 0.25s ease-in ;
        }

        .underline.focus::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

      </style>
      <div class="underline">
        <input id="input" .type="${this.type}" .placeholder="${this.placeholder}" .value="${this.value}">
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'text';
    this.placeholder = null;
    this.value = null;
    this.error = false;
  }

  static get properties() { return {
    type: String,
    placeholder: String,
    value: String,
    error: { type: Boolean, reflect: true }
  }}

  firstUpdated() {
    this.__els = {
      input: this.renderRoot.getElementById('input')
    };

    [ this.__els.input
    ].forEach(elem => {
      elem.addEventListener('input', this.__updateValue.bind(this));
      elem.addEventListener('focus', this.__focusUnderline.bind(this));
      elem.addEventListener('blur', this.__focusUnderline.bind(this));
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    [ this.__els.input
    ].forEach(elem => {
      elem.removeEventListener('input', this.__updateValue.bind(this));
      elem.removeEventListener('focus', this.__focusUnderline.bind(this));
      elem.removeEventListener('blur', this.__focusUnderline.bind(this));
    });
  }

  __updateValue(e) {
    const target = e.target;
    this.value = target.value;
  }

  __focusUnderline(e) {
    if (e.type === "focus") {
      e.target.parentNode.classList.add('focus');
    } else if (e.type === "blur") {
      e.target.parentNode.classList.remove('focus');
    }
  }
}
customElements.define(UnderlineInput.is, UnderlineInput);
