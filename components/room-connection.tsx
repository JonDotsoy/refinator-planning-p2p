import React, { FC, Fragment, useEffect, useMemo, useState } from "react";
import { Button, ButtonLink } from "./atoms/button";
import { useRoomConnection } from "./use-room-connection";
import { useRoomId } from "./use-room-id";
import { v4 as uuid } from 'uuid'
import { InspectPre } from "./Inspect";
import { Input } from "./atoms/input";
import { PopupInput } from "./popup-input";
import { IconCopy } from "./icon-copy";
import classNames from "classnames";
import * as c from 'tailwindcss/colors';
import { Timestamp } from "firebase/firestore";
import { IssueCard } from "./issue-card";
import { useQueryParams } from "./use-query-params";

const percentage = new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const bgColors = [
    'bg-blue-200',
    'bg-blue-400',
    'bg-green-200',
    'bg-green-400',
    'bg-pink-200',
    'bg-pink-400',
    'bg-purple-200',
    'bg-purple-400',
    'bg-red-200',
    'bg-red-400',
    'bg-yellow-200',
    'bg-yellow-400',
].sort(() => Math.random() - 0.5);

const bgColorByChar = (char: string) => {
    const index = char.charCodeAt(0) % bgColors.length
    return bgColors[index]
}


export const RoomConnection: FC<{ roomId: string }> = ({ roomId }) => {
    const [queryDebug] = useQueryParams('debug')
    const [, setRoomId] = useRoomId();
    const e = useRoomConnection(roomId);
    const modeDebug = queryDebug === 'on'

    return <>
        <div className="flex justify-center">
            <div className="container p-4 w-full space-y-4">
                {e.loggedIn && <>
                    <div>
                        <h2 className="text-6xl">Hola <strong>{e.identification?.name}</strong></h2>
                        {/* <span className="text-gray-400">{e.localUid} <IconCopy value={() => e.localUid} /></span> */}
                    </div>
                </>}

                <div className="space-x-2">
                    <Button onClick={() => setRoomId(uuid())}>Ir a nueva sala</Button>
                    <PopupInput onValueChange={name => e.logIn(name)} value={e.identification?.name}>{e.identification ? `Cambiar nombre` : 'Ingresar'}</PopupInput>
                    {e.loggedIn && <Button onClick={() => e.logOut()}>Salir</Button>}
                </div>

                <section>
                    {!e.issue && <>
                        <div className="bg-gray-50 py-8 rounded border border-gray-400 text-center text-gray-400">
                            Aún no hay tarea seleccionada.
                        </div>
                    </>}
                    {e.issue && <>
                        <div className="bg-white py-8 rounded border border-blue-100 text-center flex flex-col justify-center items-center space-y-2">
                            <div className="border py-2 px-4 rounded flex flex-col items-start text-xl shadow bg-white">
                                <span className="block text-gray-300 text-sm">{e.issue.id}</span>
                                <div>{e.issue.description}</div>
                            </div>
                            <div>
                                {
                                    e.statusVoting.status === 'none' &&
                                    <Button onClick={() => e.changeTypeRoomVoting('inVoting')}>Iniciar votación</Button>
                                }
                                {
                                    e.statusVoting.status === 'inVoting' &&
                                    <Button className="bg-blue-300 text-white border-blue-400 hover:bg-blue-400" onClick={() => e.changeTypeRoomVoting('done')}>Terminar votación</Button>
                                }
                                {
                                    e.statusVoting.status === 'done' && <>
                                        <div className="flex flex-col items-center">
                                            <div className="flex-1">
                                                <ButtonLink onClick={() => e.changeTypeRoomVoting('inVoting')}>Reiniciar votación</ButtonLink>
                                            </div>
                                            <div>
                                                <h3>Resultados:</h3>

                                                <div className="grid grid-cols-5 grid-flow-row gap-4">
                                                    <div className="text-gray-500">Nivel</div>
                                                    <div className="text-gray-500">Conteo</div>
                                                    <div className="text-gray-500">Porcentaje</div>
                                                    <div className="col-span-2"></div>

                                                    {Object.entries(e.resultVotingCurrentIssue.result).map(([level, count]) => {
                                                        if (count === 0) return null

                                                        return <Fragment key={level}>
                                                            <div><span>{level}</span></div>
                                                            <div>{number.format(count)}</div>
                                                            <div className="font-bold">{percentage.format(count / e.resultVotingCurrentIssue.total)}</div>
                                                            <div className="col-span-2">
                                                                <button className="border px-2" onClick={() => e.markLevelOnIssue(level)}>Marcar tarea con esta nivel</button>
                                                            </div>
                                                        </Fragment>

                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                            <button onClick={e.cleanSelectIssue} className="text-blue-700 text-opacity-70">Quitar selección</button>
                        </div>
                    </>}
                </section>

                {
                    e.statusVoting.status === 'inVoting' &&
                    <section className="flex flex-col items-center">
                        <p>Ahora puedes votar, selecciona una opción:</p>
                        <div>
                            {e.levels.map((level, index) => {
                                return <Button key={`${index}-${level}`} className={classNames({ 'border-blue-600 text-blue-600 shadow': e.selfVotingCurrentIssue?.value === level })} onClick={() => e.voting(level)}>{level}</Button>
                            })}
                            <Button onClick={() => e.removeVoting()}>Eliminar voto</Button>
                        </div>
                    </section>
                }

                <section className="flex space-x-4 justify-center flex-row">
                    {e.identifications.map(i => <div
                        key={i.uid}
                        className="flex flex-col items-center space-y-2"
                    >
                        <div
                            onClick={() => i.self && e.toggleParticipating()}
                            style={{ width: '50px', height: '80px' }}
                            className={classNames(
                                "transition",
                                "text-center text-5xl flex justify-center items-center border rounded-lg",
                                {
                                    "border-gray-200 text-gray-200": i.observer,
                                    [bgColorByChar(i.name?.[0])]: !i.observer,
                                    "border-gray-400 hover:shadow-md": !i.observer,
                                },
                            )}
                        >{i.name?.[0].toUpperCase()}</div>
                        <h3 className={classNames(
                            "text-center transition-all",
                            {
                                "text-gray-400": i.observer,
                            },
                        )}>
                            {i.name}
                        </h3>
                        {i.observer && <span className="inline-block text-gray-400">(Es Observador)</span>}
                    </div>)}
                </section>

                <section>
                    <div>
                        <Button onClick={e.createNewIssue}>Crear nueva tarea</Button>
                    </div>
                    {!e.issues.length && <div className="text-gray-500">Crea tu primera tarea.</div>}
                    {!!e.issues.length && <>
                        <div className="space-y-4">
                            {e.issues.map((i, index) => <IssueCard
                                key={i.id}
                                issue={i}
                                onDeleteIssue={(i) => e.removeIssue(i.id)}
                                onUpdateDescriptionIssue={(i, description) => e.updateDescriptionIssue(i, description)}
                                onSelectIssue={(i) => e.selectIssue(i)}
                            />)}
                        </div>
                    </>}
                </section>

                {
                    modeDebug && <div>
                        {/* <hr /> */}
                        <InspectPre src={e}></InspectPre>
                    </div>
                }
            </div>
        </div>
    </>;
}
