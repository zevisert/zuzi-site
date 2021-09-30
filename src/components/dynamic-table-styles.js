/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

import { html } from 'lit';


export const SharedDynamicTable = html`
<style>
  .limiter {
    width: 100%;
    margin: 0 auto;
    margin-bottom: 10px;
  }

  .table100-head {
    color: black;
    border: 2px solid black;
    font-weight: bold;
  }

  .container-table100 {
    width: 100%;

    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    align-items: start;
    justify-content: start;
    flex-wrap: wrap;
  }

  .wrap-table100 {
    width: 1170px;
  }

  table {
    border-spacing: 1;
    border-collapse: collapse;
    overflow: hidden;
    width: 100%;
    margin: 0 auto;
    position: relative;
  }

  table * {
    position: relative;
  }

  table td,
  table th {
    padding-left: 8px;
  }

  table thead tr {
    height: 60px;
  }

  table tbody tr {
    height: 50px;
  }

  table tbody tr:last-child {
    border: 0;
  }

  table td,
  table th,
  table td.l,
  table th.l {
    text-align: left;
  }

  table td.c,
  table th.c {
    text-align: center;
  }

  table td.r,
  table th.r {
    text-align: right;
  }

  .table100-head th {
    line-height: 1.2;
    font-weight: unset;
  }

  tbody tr:nth-child(even) {
    background-color: #eee;
  }

  tbody tr {
    line-height: 1.2;
    font-weight: unset;
  }

  tbody tr:hover {
    color: #555;
    background-color: #eee;
    cursor: pointer;
  }

  @media screen and (max-width: 725px) {
    table {
      display: block;
    }

    table > *,
    table tr,
    table td,
    table th {
      display: block;
    }

    table thead {
      display: none;
    }

    table tbody tr {
      height: auto;
      padding: 37px 0;
    }

    table tbody tr td {
      padding-left: 40% !important;
      margin-bottom: 24px;
    }

    table tbody tr td:last-child {
      margin-bottom: 0;
    }

    table tbody tr td:before {
      line-height: 1.2;
      position: absolute;
      width: 40%;
      left: 30px;
      top: 0;
    }

    .column1,
    .column2,
    .column3,
    .column4,
    .column5,
    .column6,
    .column7,
    .column8,
    .column9 {
      width: 100%;
    }

    tbody tr {
      font-size: 14px;
    }
  }
</style>
`;
