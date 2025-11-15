import React, { useEffect, useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext.jsx'
import api from '../api/axios'

export default function Profile() {
    const { user, refreshMe, logout } = useAuth()
    const [form, setForm] = useState({ first_name: '', last_name: '' })
    const [pw, setPw] = useState({ old_password:'', new_password:'' })
    const [ok1, setOk1] = useState(null)
    const [ok2, setOk2] = useState(null)
    const [err, setErr] = useState(null)

    useEffect(() => {
        if (user) {
            setForm({ first_name: user.first_name || '', last_name: user.last_name || '' })
        }
    }, [user])

    const ch = (k) => (e) => setForm(s => ({...s, [k]: e.target.value}))
    const chPw = (k) => (e) => setPw(s => ({...s, [k]: e.target.value}))

    const saveProfile = async (e) => {
        e.preventDefault()
        setOk1(null); setErr(null)
        try {
            await api.put('/api/auth/me', form)
            await refreshMe()
            setOk1('Zapisano dane profilu.')
        } catch {
            setErr('Nie udało się zapisać profilu.')
        }
    }

    const changePw = async (e) => {
        e.preventDefault()
        setOk2(null); setErr(null)
        try {
            await api.post('/api/auth/change-password', pw)
            setOk2('Hasło zmienione. Zaloguj się ponownie.')
            logout()
        } catch {
            setErr('Nie udało się zmienić hasła.')
        }
    }

    return (
        <div className="row g-3">
            <div className="col-md-6">
                <Card className="p-3">
                    <h5>Dane profilu</h5>
                    {ok1 && <Alert variant="success">{ok1}</Alert>}
                    {err && <Alert variant="danger">{err}</Alert>}
                    <Form onSubmit={saveProfile}>
                        <Form.Group className="mb-2">
                            <Form.Label>Imię</Form.Label>
                            <Form.Control value={form.first_name} onChange={ch('first_name')} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Nazwisko</Form.Label>
                            <Form.Control value={form.last_name} onChange={ch('last_name')} />
                        </Form.Group>
                        <Button type="submit">Zapisz</Button>
                    </Form>
                </Card>
            </div>
            <div className="col-md-6">
                <Card className="p-3">
                    <h5>Zmiana hasła</h5>
                    {ok2 && <Alert variant="success">{ok2}</Alert>}
                    {err && <Alert variant="danger">{err}</Alert>}
                    <Form onSubmit={changePw}>
                        <Form.Group className="mb-2">
                            <Form.Label>Stare hasło</Form.Label>
                            <Form.Control type="password" value={pw.old_password} onChange={chPw('old_password')} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Nowe hasło</Form.Label>
                            <Form.Control type="password" value={pw.new_password} onChange={chPw('new_password')} />
                        </Form.Group>
                        <Button type="submit">Zmień hasło</Button>
                    </Form>
                </Card>
            </div>
        </div>
    )
}