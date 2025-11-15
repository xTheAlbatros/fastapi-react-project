import React from 'react'
import { Button } from 'react-bootstrap'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const { id, title, description = '', color, completed, day, at_time } = task

    const borderColor = (color && color.trim()) || '#c2bfc7'
    const displayTime = at_time ? at_time.slice(0, 5) : null

    const containerStyle = {
        border: '2px solid',
        borderColor,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '0.9rem',
        background: '#fff',
        position: 'relative',
        overflow: 'hidden',
        opacity: completed ? 0.5 : 1,
    }

    const lines = description
        .split(/\r?\n/)
        .map(s => s.replace(/^\s*([-–•*]\s*)/, '').trim())
        .filter(Boolean)

    return (
        <div className={`task-card ${completed ? 'completed' : ''}`} style={containerStyle}>
            {completed && (
                <svg
                    className="task-diagonal"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <line x1="-2" y1="102" x2="102" y2="-2" />
                </svg>
            )}

            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!completed}
                        onChange={() => onToggle(task)}
                        aria-label="Ukończone"
                    />
                    <h5 className="m-0">{title}</h5>
                </div>

                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => onEdit(task)}>Edy­tuj</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => onDelete(id)}>Usuń</Button>
                </div>
            </div>

            <div className="text-muted mb-2">
                {displayTime && <>godz. {displayTime} • </>}
                {day && format(new Date(day), 'yyyy-MM-dd', { locale: pl })}
            </div>

            {lines.length > 0 && (
                <ul className="m-0 ps-4">
                    {lines.map((ln, i) => <li key={i} style={{ margin: '.15rem 0' }}>{ln}</li>)}
                </ul>
            )}
        </div>
    )
}