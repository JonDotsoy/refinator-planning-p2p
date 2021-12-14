import { arrayRemove, arrayUnion, deleteField, doc, DocumentData, FieldPath, Timestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { firestore, l } from './firebase/firebase';
import { v4 as uuid } from 'uuid'
import { createAlertLog } from './alert-logs';
import { isIssue } from './is-issue';
import { Issue } from './types/issue';
import { isStatusVoting } from './isStatusVoting';
import { StatusVoting } from './StatusVoting';
import { onSnapshotBeforeCreateIfNotExist } from './onSnapshotBeforeCreateIfNotExist';
import { localUid } from './localUid';


export const useRoomConnection = (roomId: string) => {
    useEffect(() => {
        l('room_connection', { roomId });
    }, [roomId]);

    const levels = useMemo(() => [
        'XS',
        'S',
        'M',
        'L',
        'XL',
        'XXL',
    ], []);

    const [tick, setTick] = useState(0);
    const [loading, setLoading] = useState(true);
    const docRef = useMemo(() => doc(firestore, 'rooms', roomId), [roomId]);
    const [room, setRoom] = useState<DocumentData | null>(null);
    const [error, setError] = useState<any>(null);

    const identifications = Object
        .entries(room?.participants ?? {})
        .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        .map(([uid, entry]: [string, any]) => {
            const activated = true;
            return ({
                uid,
                self: uid === localUid,
                activated,
                observer: !!entry.observer,
                ...entry
            });
        })
        .filter(entry => entry.activated && entry.name);

    const identification = identifications.find(entry => entry.self);
    const loggedIn = !!identification && !!identification.name;

    const issueActivated = typeof room?.issue === 'string' ? room.issue : null;
    const issueValue = issueActivated ? room?.issuesValues[issueActivated] : null;
    const issue = isIssue(issueValue) ? issueValue : null;
    const issues = (room?.issues && Array.isArray(room.issues) ? room.issues : [])
        .map(issue => room?.issuesValues[issue])
        .filter((issue): issue is Issue => isIssue(issue))

    const statusVoting: StatusVoting = isStatusVoting(room?.statusVoting) ? room!.statusVoting : { status: 'none' };

    const votingCurrentIssue = issue?.voting;
    const selfVotingCurrentIssue = issue?.voting?.[localUid];

    const resultVotingCurrentIssue = useMemo(() => {
        let max = 0;
        let total = 0;
        const result = Object.entries(votingCurrentIssue ?? {})
            .filter(([uid, value]) => levels.includes(value.value))
            .reduce((acc, [uid, value]) => {
                const count = (acc[value.value] || 0) + 1;

                max = Math.max(max, count);
                total += 1;

                return ({
                    ...acc,
                    [value.value]: count,
                });
            }, Object.fromEntries(levels.map(l => [l, 0])) as Record<string, number>)

        return {
            max,
            total,
            result,
        } as const;
    }, [votingCurrentIssue, levels]);


    const update = (data: DocumentData) => {
        updateDoc(docRef, data)
            .catch(e => {
                console.error(e);
                createAlertLog(`Error updating room ${roomId}`);
            });
    }

    useEffect(() => {
        setLoading(true)
        const unsubscribe = onSnapshotBeforeCreateIfNotExist(
            docRef,
            (snapshot) => {
                // onceTickLastPing();
                setLoading(false);
                setRoom(snapshot.data()!);
            },
            (error) => {
                setError(error);
            },
        );

        return () => {
            unsubscribe();
        }
    }, [docRef]);

    const logIn = (name: string) => {
        update({
            [`participants.${localUid}.name`]: name,
            [`participants.${localUid}.loggedAt`]: Timestamp.now(),
        });
    }

    const logOut = () => {
        const deletingVoting = Object.keys(room?.issuesValues ?? {}).reduce((acc, issueId) => ({
            [`issuesValues.${issueId}.voting.${localUid}`]: deleteField(),
        }), {});
        update({
            ...deletingVoting,
            [`participants.${localUid}`]: deleteField(),
        });
    }

    const toggleParticipating = () => {
        update({
            [`participants.${localUid}.observer`]: !identification?.observer,
        });
    }

    const createNewIssue = () => {
        const id = uuid();
        return update({
            [`issues`]: arrayUnion(id),
            [`issuesValues.${id}`]: {
                id,
                description: '',
            },
        });
    };

    const removeIssue = (itemId: any) => {
        update({
            [`issues`]: arrayRemove(itemId),
            [`issuesValues.${itemId}`]: deleteField(),
        });
    }

    const updateDescriptionIssue = (issue: Issue, description: string) => {
        update({
            [`issuesValues.${issue.id}.description`]: description,
        })
    }

    const selectIssue = (issue: Issue) => {
        update({
            [`statusVoting.status`]: 'none',
            [`issue`]: issue.id,
        });
    }

    const cleanSelectIssue = () => {
        update({
            [`statusVoting.status`]: 'none',
            [`issue`]: deleteField(),
        });
    }

    const changeTypeRoomVoting = (type: 'none' | 'inVoting' | 'done') => {
        update({
            [`statusVoting.status`]: type,
        })
    }

    const voting = (level: string) => {
        update({
            [`issuesValues.${issueActivated}.voting.${localUid}.value`]: level,
        });
    }

    const removeVoting = () => {
        update({
            [`issuesValues.${issueActivated}.voting.${localUid}`]: deleteField(),
        });
    }

    const markLevelOnIssue = (level: string | null) => {
        update({
            [`issuesValues.${issueActivated}.level`]: level === null ? deleteField() : level,
        });
    }

    return {
        markLevelOnIssue,
        resultVotingCurrentIssue,
        levels,
        statusVoting,
        votingCurrentIssue,
        selfVotingCurrentIssue,
        localUid,
        removeVoting,
        voting,
        selectIssue,
        changeTypeRoomVoting,
        cleanSelectIssue,
        createNewIssue,
        removeIssue,
        updateDescriptionIssue,
        issueActivated,
        issue,
        issues,
        loggedIn: loggedIn,
        identification,
        identifications,
        loading,
        logIn: logIn,
        logOut,
        toggleParticipating,
        room,
        update,
    } as const;
}
