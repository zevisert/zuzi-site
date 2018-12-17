import { html } from '@polymer/lit-element';

export const InputTextNumber = html `
<style>
    input[type="text"],
    input[type="number"] {
        font-size: 16px;
        line-height: 2rem;
        border: 0;
        background: none;
        outline: none;
    }
</style>
`;

export const InputUnderline = html `
<style>
    .underline {
        display: inline-block;
        position: relative;
    }

    .underline::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        bottom: 0;
        left: 0;
        background-color: lightgray;
    }

    .underline::after {
        content: '';
        position: absolute;
        width: 100%;
        transform: scaleX(0);
        height: 1px;
        bottom: 0;
        left: 0;
        background-color: darkcyan;
        transform-origin: bottom right;
        transition: transform 0.25s ease-in;
    }

    .underline.focus::after {
        transform: scaleX(1);
        transform-origin: bottom left;
    }
</style>
`;
