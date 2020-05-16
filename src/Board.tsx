import React, { useState } from 'react';
import { Stage, Layer, RegularPolygon } from "react-konva";
import { produce, immerable } from "immer";

enum State {
    Empty,
    PlayerA,
    PlayerB,
    DominatedA,
    DominatedB,
}

type Player = State.PlayerA | State.PlayerB;

const color = (field: State) => {
    switch (field) {
        case State.Empty: return '#FCDC5F';
        case State.PlayerA: return '#D2111B';
        case State.PlayerB: return '#3F48CC';
        case State.DominatedA: return '#F8A7AB';
        case State.DominatedB: return '#CACDF0';
    }
}

const playerNameHtml = (player: Player) => <span style={{ color: color(player) }}>{player === State.PlayerA ? 'Red' : 'Blue'}</span>;

const isEnemy = (player: Player, field: State) => {
    if (player === State.PlayerA) {
        return [State.PlayerB, State.DominatedB].includes(field);
    } else {
        return [State.PlayerA, State.DominatedA].includes(field);
    }
}

const canPlace = (player: Player, field: State) => {
    if (player === State.PlayerA) {
        return [State.Empty, State.DominatedA].includes(field);
    } else {
        return [State.Empty, State.DominatedB].includes(field);
    }
}

const isEmpty = (field: State) => ![State.PlayerA, State.PlayerB].includes(field);

interface Point {
    q: number,
    r: number,
}

const add = (p: Point, v: Point): Point => ({ q: p.q + v.q, r: p.r + v.r });

const unitVectors: Point[] = [
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: 1, r: -1 },
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
];

class Game {
    board: State[][]
    turnPlayer: Player
    turnMove: number
    turnNumber: number

    [immerable] = true

    constructor(size: number) {
        const diameter = size * 2 - 1;
        this.board = [];
        for (let i = 0; i < diameter; i += 1) {
            this.board.push(Array(diameter).fill(State.Empty));
        }
        this.turnPlayer = State.PlayerA;
        this.turnMove = 1;
        this.turnNumber = 1;
    }

    get sideLen() {
        return Math.ceil(this.board.length / 2);
    }

    get diamLen() {
        return this.board.length;
    }

    at(p: Point) {
        console.assert(this.inBounds(p));
        return this.board[p.r][p.q];
    }

    inBounds(p: Point) {
        return p.q >= 0 && p.r >= 0 && p.q + p.r >= this.sideLen - 1 && p.q < this.diamLen && p.r < this.diamLen && p.r + p.q < this.diamLen + this.sideLen - 1;
    }

    move(p: Point) {
        return produce(this, draft => {
            draft.board[p.r][p.q] = draft.turnPlayer;
            for (const v of unitVectors) {
                let p2 = add(p, v);
                while (draft.inBounds(p2) && isEmpty(draft.at(p2))) {
                    draft.board[p2.r][p2.q] = draft.dominator(p2);
                    p2 = add(p2, v);
                }
            }
            if (draft.turnMove === 1 && draft.turnNumber > 1) {
                draft.turnMove += 1;
            } else {
                draft.turnMove = 1;
                draft.turnPlayer = draft.turnPlayer === State.PlayerA ? State.PlayerB : State.PlayerA;
                draft.turnNumber += 1;
            }
        });
    }

    dominator(p: Point) {
        let playerA = 0;
        let playerB = 0;
        for (const v of unitVectors) {
            let p2 = p;
            while (true) {
                p2 = add(p2, v);
                if (!this.inBounds(p2)) break;

                if (this.at(p2) === State.PlayerA) {
                    playerA += 1;
                    break;
                } else if (this.at(p2) === State.PlayerB) {
                    playerB += 1;
                    break;
                }
            }
        }
        if (playerA === playerB) {
            return State.Empty;
        } else if (playerA > playerB) {
            return State.DominatedA;
        } else {
            return State.DominatedB;
        }
    }

    count() {
        let playerA = 0;
        let playerB = 0;
        for (let r = 0; r < this.diamLen; r += 1) {
            for (let q = 0; q < this.diamLen; q += 1) {
                const p: Point = { q, r };
                if (!this.inBounds(p)) continue;

                if (isEnemy(State.PlayerA, this.at(p))) {
                    playerB += 1;
                } else if (isEnemy(State.PlayerB, this.at(p))) {
                    playerA += 1;
                }
            }
        }
        return { playerA, playerB };
    }
}

const Board = () => {
    const [game, setGame] = useState(() => new Game(6));

    const stageW = window.innerWidth;
    const stageH = 800;
    const hexBigR = 30;
    const hexSmallD = Math.sqrt(3) * hexBigR;
    const hexSmallR = hexSmallD / 2;

    const count = game.count();

    let winner: Player | State.Empty = State.Empty;
    if (!game.board.some((row, r) => row.some((cell, q) => game.inBounds({ q, r }) && canPlace(game.turnPlayer, cell)))) {
        winner = count.playerA > count.playerB ? State.PlayerA : State.PlayerB;
    }

    return <>
        <div>
            Board size: <input type="number" min={1} value={game.sideLen} onChange={evt => setGame(new Game(Number(evt.target.value)))} />
        </div>
        <div>
            Turn {game.turnNumber}, move {game.turnMove}.{' '}
            {playerNameHtml(State.PlayerA)} has {count.playerA} fields. {playerNameHtml(State.PlayerB)} has {count.playerB} fields.{' '}
            <button onClick={() => setGame(new Game(game.sideLen))}>Reset</button>
        </div>
        <div>
            {winner !== State.Empty
                ? <>Player {playerNameHtml(winner)} won.</>
                : <>{playerNameHtml(game.turnPlayer)} player's turn.</>
            }
        </div>
        <Stage width={stageW} height={stageH}>
            <Layer>
                {game.board.flatMap((row, r) => {
                    const startX = r * hexSmallR;
                    return row.flatMap((cell, q) => {
                        const p = { q, r };
                        if (!game.inBounds(p)) return [];

                        return [<RegularPolygon
                            sides={6}
                            radius={hexBigR}
                            fill={color(cell)}
                            stroke="black"
                            strokeWidth={1}
                            x={50 + startX + hexSmallD * q}
                            y={50 + (hexBigR * 1.5) * r}
                            key={`${q}_${r}`}
                            onClick={evt => {
                                if (evt.evt.button !== 0) return;
                                if (!canPlace(game.turnPlayer, game.at(p))) return;

                                setGame(prev => prev.move(p));
                            }}
                        />];
                    })
                })}
            </Layer>
        </Stage>
    </>
}

export default Board;
