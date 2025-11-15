import React, { useEffect, useMemo, useState } from 'react'
import { Card, Button, Form, Modal, Badge } from 'react-bootstrap'
import { addMonths, subMonths, format, isToday as dfIsToday } from 'date-fns'
import { pl } from 'date-fns/locale'
import { monthMatrix, isSameMonth, formatDate } from '../utils/date.js'
import api from '../api/axios'
import TaskItem from '../components/TaskItem.jsx'

const isValidHHMM = (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val || '')

export default function CalendarPage() {
    const [current, setCurrent] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState(null)
    const [tasks, setTasks] = useState([])
    const [show, setShow] = useState(false)
    const [edit, setEdit] = useState(null)
    const [errors, setErrors] = useState({})
    const [form, setForm] = useState({
        title: '',
        description: '',
        at_time: '',
        useColor: false,
        color: '#6f42c1',
        completed: false,
    })

    const weeks = useMemo(() => monthMatrix(current), [current])
    const title = format(current, 'LLLL yyyy', { locale: pl })
    const monthParam = format(current, 'yyyy-MM')

    const load = async () => {
        const { data } = await api.get('/api/tasks', { params: { month: monthParam } })
        setTasks(data)
    }
    useEffect(() => { load() }, [monthParam])

    const dayTasks = (dStr) => tasks.filter(t => t.day === dStr)
    const countTasks = (d) => dayTasks(formatDate(d)).length

    const openDay = (d) => setSelectedDay(formatDate(d))

    const resetErrors = () => setErrors({})

    const openNew = () => {
        setEdit(null)
        setForm({
            title: '',
            description: '',
            at_time: '',
            useColor: false,
            color: '#6f42c1',
            completed: false,
        })
        resetErrors()
        setShow(true)
    }

    const openEdit = (t) => {
        setEdit(t)
        setForm({
            title: t.title,
            description: t.description || '',
            at_time: t.at_time ? t.at_time.slice(0, 5) : '',
            useColor: !!t.color,
            color: t.color || '#6f42c1',
            completed: !!t.completed,
        })
        resetErrors()
        setShow(true)
    }

    const setField = (k, v) => {
        setForm(s => ({ ...s, [k]: v }))
        if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.title.trim()) e.title = 'Tytuł jest wymagany'
        if (!form.description.trim()) e.description = 'Opis jest wymagany'
        if (form.at_time && !isValidHHMM(form.at_time)) e.at_time = 'Podaj godzinę w formacie HH:MM'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const save = async () => {
        if (!selectedDay) return
        if (!validate()) return

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            day: selectedDay,
            ...(form.at_time ? { at_time: `${form.at_time}:00` } : {}),
            ...(form.useColor && form.color ? { color: form.color } : {}),
            ...(edit ? { completed: !!form.completed } : {}),
        }

        if (edit) await api.put(`/api/tasks/${edit.id}`, payload)
        else await api.post('/api/tasks', payload)

        setShow(false)
        resetErrors()
        load()
    }

    const onToggle = async (t) => { await api.put(`/api/tasks/${t.id}`, { completed: !t.completed }); load() }
    const onDelete = async (id) => { await api.delete(`/api/tasks/${id}`); load() }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="outline-secondary" onClick={() => setCurrent(subMonths(current,1))}>
                    Poprzedni
                </Button>
                <h5 className="m-0 text-capitalize">{title}</h5>
                <Button variant="outline-secondary" onClick={() => setCurrent(addMonths(current,1))}>
                    Następny
                </Button>
            </div>

            <Card className="p-3">
                {/* nagłówek dni tygodnia */}
                <div className="row row-cols-7 text-center fw-semibold small mb-2">
                    {['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(d => <div key={d} className="col">{d}</div>)}
                </div>

                {/* siatka dni */}
                {weeks.map((w,i) => (
                    <div className="row row-cols-7 g-2 mb-2" key={i}>
                        {w.map((d,j) => {
                            const dStr = formatDate(d)
                            const muted = isSameMonth(d, current) ? '' : 'text-muted'
                            const isSelected = selectedDay === dStr
                            const isToday = dfIsToday(d)
                            const tasksNo = countTasks(d)

                            const border =
                                isSelected ? 'border-success border-2'
                                    : isToday ? 'border-warning border-2'
                                        : 'border border-secondary'

                            const btnClass = isSelected ? 'btn-outline-success' : 'btn-outline-secondary'

                            return (
                                <div key={j} className="col">
                                    <div className={`position-relative calendar-cell ${muted}`}>
                                        <button
                                            className={`btn w-100 h-100 calendar-btn ${btnClass} ${border}`}
                                            onClick={() => openDay(d)}
                                        >
                                            <div className="fs-6">{format(d,'d')}</div>
                                        </button>

                                        {tasksNo > 0 && (
                                            <Badge
                                                bg="info"
                                                className="position-absolute top-0 end-0 translate-middle badge-rounded-pill"
                                                title={`${tasksNo} zadań`}
                                            >
                                                {tasksNo}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </Card>

            {selectedDay && (
                <Card className="p-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="m-0">Zadania: {selectedDay}</h6>
                        <Button onClick={openNew}>Dodaj</Button>
                    </div>
                    <div className="mt-2">
                        {dayTasks(selectedDay).length === 0 && (
                            <div className="text-muted">Brak zadań dla tego dnia.</div>
                        )}
                        {dayTasks(selectedDay).map(t => (
                            <TaskItem
                                key={t.id}
                                task={t}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onEdit={openEdit}
                            />
                        ))}
                    </div>
                </Card>
            )}

            <Modal show={show} onHide={() => { setShow(false); resetErrors() }}>
                <Modal.Header closeButton>
                    <Modal.Title>{edit ? 'Edytuj zadanie' : 'Nowe zadanie'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate>
                        <Form.Group className="mb-3" controlId="calTaskTitle">
                            <Form.Label>Tytuł</Form.Label>
                            <Form.Control
                                value={form.title}
                                onChange={(e)=>setField('title', e.target.value)}
                                isInvalid={!!errors.title}
                                placeholder="Np. Wizyta u lekarza"
                                required
                            />
                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="calTaskDesc">
                            <Form.Label>Opis</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={form.description}
                                onChange={(e)=>setField('description', e.target.value)}
                                isInvalid={!!errors.description}
                                placeholder="Szczegóły zadania"
                                required
                            />
                            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="calTaskTime">
                            <Form.Label>Godzina (opcjonalnie)</Form.Label>
                            <Form.Control
                                type="time"
                                step="60"
                                value={form.at_time}
                                onChange={(e)=>setField('at_time', e.target.value)}
                                isInvalid={!!errors.at_time}
                                placeholder="HH:MM"
                                inputMode="numeric"
                                pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                            />
                            <Form.Control.Feedback type="invalid">{errors.at_time}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Check
                            type="switch"
                            id="calUseColor"
                            className="mb-2"
                            label="Użyj koloru"
                            checked={form.useColor}
                            onChange={(e)=>setField('useColor', e.target.checked)}
                        />

                        <Form.Group className="mb-3" controlId="calTaskColor">
                            <Form.Label>Kolor (opcjonalnie – paleta)</Form.Label><br/>
                            <input
                                type="color"
                                value={form.color}
                                onChange={(e)=>setField('color', e.target.value)}
                                disabled={!form.useColor}
                                style={{ width: 64, height: 40, border: '1px solid #ced4da', borderRadius: 8 }}
                            />
                        </Form.Group>

                        {edit && (
                            <Form.Check
                                type="checkbox"
                                label="Ukończone"
                                checked={form.completed}
                                onChange={(e)=>setField('completed', e.target.checked)}
                            />
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShow(false); resetErrors() }}>
                        Anuluj
                    </Button>
                    <Button onClick={save}>Zapisz</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}