import { LitElement, html } from '@polymer/lit-element';

export class NavBox extends LitElement {
  static get is() { return 'nav-box' }
  static get properties() { return {
    page: { type: String },
    target: { type: String },
    title: { type: String }
  }}

  render() {
    return html`
      <style>
        .wrapper {
          text-decoration: none;
        }

        .border {
          stroke-dasharray: 140 540;
          stroke-dashoffset: -474;
        }

        .border {
          stroke-width: 2px;
          fill: transparent;
          stroke: black;
          transition: stroke-width 1s, stroke-dashoffset 1s, stroke-dasharray 1s;
        }

        .text {
          display: inline-block;
          text-decoration: none;
          text-anchor: middle;
          font-family: 'Julius Sans One';
          color: black;
        }

        .wrapper[selected] .border {
          stroke-dashoffset: 0;
          stroke-dasharray: 760;
        }

        .wrapper[selected] .text {
          font-weight: bold;
        }

      </style>
      <a class="wrapper" ?selected="${this.page === this.target}" href="/${this.target}">
        <svg height="27" width="75">
          <rect class="border" height="27" width="75" />
          <text y="20" x="37.5" class="text">${this.title}</text>
        </svg>
      </a>
    `
  }
}

customElements.define(NavBox.is, NavBox)
