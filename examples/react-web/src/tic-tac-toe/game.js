/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { API, ActionRecorder } from 'bgio-ui';
import { schema, state } from './ui-schema';

function IsVictory(cells) {
  const positions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let pos of positions) {
    const symbol = cells[pos[0]];
    let winner = symbol;
    for (let i of pos) {
      if (cells[i] != symbol) {
        winner = null;
        break;
      }
    }
    if (winner != null) return true;
  }

  return false;
}

const PluginUI = {
  fnWrap: moveFn => {
    return (G, ctx, ...args) => {
      const actionRecorder = new ActionRecorder();
      const api = API(schema, G._state, actionRecorder);
      ctx = { ...ctx, api };
      G = moveFn(G, ctx, ...args);
      G = {
        ...G,
        _actions: [...(G._actions || []), ...actionRecorder.actions],
      };
      return G;
    };
  },
};

const TicTacToe = {
  name: 'tic-tac-toe',

  setup: () => ({
    cells: new Array(9).fill(null),
    _state: state,
  }),

  plugins: [PluginUI],

  moves: {
    clickCell(G, ctx, id) {
      const cells = [...G.cells];

      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
        return { ...G, cells };
      }
    },

    move: (G, ctx, { obj }) => {
      const symbol = ctx.currentPlayer === '0' ? 'O' : 'X';
      ctx.api
        .object('point-' + symbol)
        .top()
        .addTo(obj);
    },
  },

  turn: {
    moveLimit: 1,
  },

  endIf: (G, ctx) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (G.cells.filter(c => c === null).length == 0) {
      return { draw: true };
    }
  },

  ai: {
    enumerate: G => {
      let r = [];
      for (let i = 0; i < 9; i++) {
        if (G.cells[i] === null) {
          r.push({ move: 'clickCell', args: [i] });
        }
      }
      return r;
    },
  },
};

export default TicTacToe;
