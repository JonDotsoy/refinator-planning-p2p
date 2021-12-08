import React, { FC, useState } from "react";
import { Button } from "./atoms/button";
import { InspectPre } from "./Inspect";
import { Issue } from "./types/issue";

interface IssueCardProps {
    issue: Issue;
    onUpdateDescriptionIssue?: (issue: Issue, description: string) => void;
    onDeleteIssue?: (issue: Issue) => void;
    onSelectIssue?: (issue: Issue) => void;
}

export const IssueCard: FC<IssueCardProps> = ({ issue, onUpdateDescriptionIssue, onDeleteIssue, onSelectIssue }) => {
    const [description, setDescription] = useState(issue.description);
    const [editing, setEditing] = useState(false);

    const edited = description !== issue.description;

    const updateHandler = () => {
        setEditing(false);
        if (edited) {
            onUpdateDescriptionIssue?.(issue, description)
        }
    }

    return <div className="flex border p-2 rounded flex-col border-gray-200">
        <div className="flex-1 space-y-4">
            <span className="text-sm text-gray-300 block">{issue.id}</span>
            {!editing && issue.description}
            {editing && <textarea
                className="w-full border border-gray-300"
                defaultValue={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
            ></textarea>}
        </div>
        <div className="space-x-2">
            <Button onClick={() => onSelectIssue?.(issue)}>Seleccionar</Button>
            {!editing && <Button onClick={() => setEditing(true)}>Editar</Button>}
            {editing && <Button onClick={() => updateHandler()}>Guardar</Button>}
            <Button onClick={() => onDeleteIssue?.(issue)}>Eliminar</Button>
        </div>
    </div>;
}
