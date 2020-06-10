import React, { useState } from 'react';
import { Stage, Layer, RegularPolygon, Text } from "react-konva";
import { produce, immerable } from "immer";

enum State {
    Empty,
    PlayerA,
    PlayerB,
    DominatedA,
    DominatedB,
    Draw,
}

type FieldState = Exclude<State, State.Draw>;
type EmptyFieldState = Exclude<FieldState, Player>;
type Player = State.PlayerA | State.PlayerB;

const color = (field: FieldState) => {
    switch (field) {
        case State.Empty: return '#FCDC5F';
        case State.PlayerA: return '#D2111B';
        case State.PlayerB: return '#3F48CC';
        case State.DominatedA: return '#F8A7AB';
        case State.DominatedB: return '#CACDF0';
    }
}

const playerNameHtml = (player: Player) => <span style={{ color: color(player) }}>{player === State.PlayerA ? 'Red' : 'Blue'}</span>;

const canPlace = (field: Field) => field.state === State.Empty;

const isEmpty = (field: Field): field is EmptyField => ![State.PlayerA, State.PlayerB].includes(field.state);

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

interface EmptyField {
    state: EmptyFieldState,
    visibleA: number,
    visibleB: number,
}

interface TakenField {
    state: Player,
}

type Field = EmptyField | TakenField;

class Game {
    board: Field[][]
    turnPlayer: Player
    turnMove: number
    turnNumber: number

    [immerable] = true

    constructor(size: number) {
        const diameter = size * 2 - 1;
        this.board = [];
        for (let i = 0; i < diameter; i += 1) {
            this.board.push(Array(diameter).fill({ state: State.Empty, visibleA: 0, visibleB: 0 }));
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
            draft.board[p.r][p.q] = {state: draft.turnPlayer};
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

    dominator(p: Point): EmptyField {
        let visibleA = 0;
        let visibleB = 0;
        for (const v of unitVectors) {
            let p2 = p;
            while (true) {
                p2 = add(p2, v);
                if (!this.inBounds(p2)) break;

                if (this.at(p2).state === State.PlayerA) {
                    visibleA += 1;
                    break;
                } else if (this.at(p2).state === State.PlayerB) {
                    visibleB += 1;
                    break;
                }
            }
        }
        let state: EmptyFieldState;
        if (visibleA === visibleB) {
            state = State.Empty;
        } else if (visibleA > visibleB) {
            state = State.DominatedA;
        } else {
            state = State.DominatedB;
        }
        return {state, visibleA, visibleB};
    }

    countScores() {
        let playerA = 0;
        let playerB = 0;
        for (let r = 0; r < this.diamLen; r += 1) {
            for (let q = 0; q < this.diamLen; q += 1) {
                const p: Point = { q, r };
                if (!this.inBounds(p)) continue;

                if (this.at(p).state === State.DominatedA) {
                    playerA += 1;
                } else if (this.at(p).state === State.DominatedB) {
                    playerB += 1;
                }
            }
        }
        return { playerA, playerB };
    }
}

const Board = () => {
    const [game, setGame] = useState(() => new Game(6));

    const hexBigR = 30;
    const hexBigD = hexBigR * 2;
    const hexSmallD = Math.sqrt(3) * hexBigR;
    const hexSmallR = hexSmallD / 2;

    const scores = game.countScores();

    let winner: Player | State.Empty | State.Draw = State.Empty;

    if (!game.board.some((row, r) => row.some((cell, q) => game.inBounds({ q, r }) && canPlace(cell)))) {
        if (scores.playerA === scores.playerB) {
            winner = State.Draw;
        } else if (scores.playerA > scores.playerB) {
            winner = State.PlayerA;
        } else {
            winner = State.PlayerB;
        }
    }

    const boardWidth = game.diamLen * hexSmallD;
    const boardHeight = game.diamLen * hexBigR * 1.5;

    const margin = 30;
    const stageW = boardWidth + margin * 2;
    const stageH = boardHeight + margin * 2;

    const offsetX = stageW / 2 - boardWidth / 2 + hexSmallR;
    const offsetY = margin + hexBigR * 0.75;

    return <>
        <div>
            Board size: <input type="number" min={1} value={game.sideLen} onChange={evt => setGame(new Game(Number(evt.target.value)))} />
        </div>
        <div>
            Turn {game.turnNumber}, move {game.turnMove}.{' '}
            {playerNameHtml(State.PlayerA)} has {scores.playerA} fields. {playerNameHtml(State.PlayerB)} has {scores.playerB} fields.{' '}
            <button onClick={() => setGame(new Game(game.sideLen))}>Reset</button>
        </div>
        <div>
            {winner === State.Empty
                ? <>{playerNameHtml(game.turnPlayer)} player's turn.</>
                : winner === State.Draw
                    ? <>Draw.</>
                    : <>Player {playerNameHtml(winner)} won.</>
            }
        </div>
        <div style={{ margin: 'auto', width: 'max-content' }}>
            <Stage width={stageW} height={stageH}>
                <Layer>
                    {game.board.flatMap((row, r) => {
                        const outOfBoundsWidth = (game.sideLen - 1) * hexSmallR;
                        const rowStartX = r * hexSmallR - outOfBoundsWidth;
                        return row.flatMap((cell, q) => {
                            const p = { q, r };
                            if (!game.inBounds(p)) return [];

                            const centerX = offsetX + rowStartX + hexSmallD * q;
                            const centerY = offsetY + hexBigR * 1.5 * r;

                            return [
                                <RegularPolygon
                                    sides={6}
                                    radius={hexBigR}
                                    fill={color(cell.state)}
                                    stroke="black"
                                    strokeWidth={1}
                                    x={centerX}
                                    y={centerY}
                                    key={`${q}_${r}`}
                                    onClick={evt => {
                                        if (evt.evt.button !== 0) return;
                                        if (!canPlace(game.at(p))) return;

                                        setGame(prev => prev.move(p));
                                    }}
                                />,
                                isEmpty(cell) && cell.visibleA - cell.visibleB !== 0 && <Text
                                    text={Math.abs(cell.visibleA - cell.visibleB).toString()}
                                    x={centerX - hexSmallR}
                                    y={centerY - hexBigR}
                                    width={hexSmallD}
                                    height={hexBigD}
                                    align="center"
                                    verticalAlign="middle"
                                    fontSize={24}
                                    key={`${q}_${r}_text`}
                                    listening={false}
                                />
                            ];
                        })
                    })}
                </Layer>
            </Stage>
        </div>
    </>
}

export default Board;
