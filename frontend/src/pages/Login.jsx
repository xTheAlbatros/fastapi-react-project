import React, { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
    const { login } = useAuth()
    const nav = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [err, setErr] = useState(null)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        setErr(null)
        setLoading(true)
        try {
            await login(email, password)
            nav('/')
        } catch (e) {
            setErr('Niepoprawny email lub hasło')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="mx-auto" style={{ maxWidth: 420 }}>
            <Card.Body>
                <Card.Title>Logowanie</Card.Title>
                {err && <Alert variant="danger">{err}</Alert>}
                <Form onSubmit={onSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Hasło</Form.Label>
                        <Form.Control type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                    </Form.Group>
                    <Button type="submit" disabled={loading}>Zaloguj</Button>
                </Form>
                <div className="mt-3">
                    Nie masz konta? <Link to="/register">Rejestracja</Link>
                </div>
            </Card.Body>
        </Card>
    )
}