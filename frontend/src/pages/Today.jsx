import React, { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext.jsx'
import api from '../api/axios'
import TaskItem from '../components/TaskItem.jsx'
import { formatDate } from '../utils/date.js'

const isValidHHMM = (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val || '')

export default function Today() {
    const { user } = useAuth()
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

    const today = formatDate(new Date())

    const load = async () => {
        const { data } = await api.get('/api/tasks', { params: { day: today } })
        setTasks(data)
    }
    useEffect(() => { load() }, [])

    const onToggle = async (t) => { await api.put(`/api/tasks/${t.id}`, { completed: !t.completed }); load() }
    const onDelete = async (id) => { await api.delete(`/api/tasks/${id}`); load() }

    const resetErrors = () => setErrors({})

    const openNew = () => {
        setEdit(null)
        setForm({ title:'', description:'', at_time:'', useColor:false, color:'#6f42c1', completed:false })
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
        // czyść błąd dla zmienianego pola
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
        if (!validate()) return

        // payload: bez pustych pól, HH:MM -> HH:MM:00
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            day: today,
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

    return (
        <>
            <h4 className="mb-3">Witaj {user?.first_name}!</h4>
            <p>To Twoja lista zadań na dziś.</p>

            <div className="d-flex justify-content-end mb-3">
                <Button onClick={openNew}>Dodaj zadanie</Button>
            </div>

            <div>
                {tasks.length === 0 && <div className="text-muted">Brak zadań na dziś.</div>}
                {tasks.map(t => (
                    <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={openEdit} />
                ))}
            </div>

            <Modal show={show} onHide={() => { setShow(false); resetErrors() }}>
                <Modal.Header closeButton>
                    <Modal.Title>{edit ? 'Edytuj zadanie' : 'Nowe zadanie'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate>
                        <Form.Group className="mb-3" controlId="taskTitle">
                            <Form.Label>Tytuł</Form.Label>
                            <Form.Control
                                value={form.title}
                                onChange={(e)=>setField('title', e.target.value)}
                                isInvalid={!!errors.title}
                                placeholder="Np. Zakupy"
                                required
                            />
                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="taskDesc">
                            <Form.Label>Opis</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={form.description}
                                onChange={(e)=>setField('description', e.target.value)}
                                isInvalid={!!errors.description}
                                placeholder="Wypisz punkty po enterze"
                                required
                            />
                            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="taskTime">
                            <Form.Label>Godzina (opcjonalnie)</Form.Label>
                            <Form.Control
                                type="time"
                                step="60"                   // tylko HH:MM
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
                            id="useColor"
                            className="mb-2"
                            label="Użyj koloru"
                            checked={form.useColor}
                            onChange={(e)=>setField('useColor', e.target.checked)}
                        />

                        <Form.Group className="mb-3" controlId="taskColor">
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
                    <Button variant="secondary" onClick={() => { setShow(false); resetErrors() }}>Anuluj</Button>
                    <Button onClick={save}>Zapisz</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}