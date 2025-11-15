import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext.jsx'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [values, setValues] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
    })
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')
    const [loading, setLoading] = useState(false)

    const setField = (name, value) => {
        setValues(v => ({ ...v, [name]: value }))
        if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
        if (serverError) setServerError('')
    }

    const validate = () => {
        const e = {}

        if (!values.email.trim()) {
            e.email = 'Email jest wymagany'
        } else if (!emailRegex.test(values.email.trim())) {
            e.email = 'Podaj poprawny adres email'
        }

        if (!values.first_name.trim()) {
            e.first_name = 'Imię jest wymagane'
        } else if (values.first_name.trim().length < 3) {
            e.first_name = 'Imię musi mieć co najmniej 3 znaki'
        }

        if (!values.last_name.trim()) {
            e.last_name = 'Nazwisko jest wymagane'
        } else if (values.last_name.trim().length < 3) {
            e.last_name = 'Nazwisko musi mieć co najmniej 3 znaki'
        }

        if (!values.password) {
            e.password = 'Hasło jest wymagane'
        } else if (values.password.length < 8) {
            e.password = 'Hasło musi mieć co najmniej 8 znaków'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    const onSubmit = async (ev) => {
        ev.preventDefault()
        setServerError('')

        if (!validate()) return

        try {
            setLoading(true)
            await register(values)
            navigate('/login')
        } catch (err) {
            const detail = err?.response?.data?.detail

            if (typeof detail === 'string' && detail.toLowerCase() === 'email already registered') {
                setErrors(e => ({ ...e, email: 'Ten adres e-mail jest już zajęty' }))
                return
            }
            const msg =
                (Array.isArray(detail) ? detail.join(', ') : detail) ||
                'Rejestracja nie powiodła się. Spróbuj ponownie później.'
            setServerError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-3">Rejestracja</Card.Title>

                            {serverError && (
                                <Alert variant="danger" className="mb-3">
                                    {serverError}
                                </Alert>
                            )}

                            <Form noValidate onSubmit={onSubmit}>
                                {/* Email */}
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={values.email}
                                        onChange={(e) => setField('email', e.target.value)}
                                        isInvalid={!!errors.email}
                                        placeholder="np. jan.kowalski@example.com"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Imię */}
                                <Form.Group className="mb-3" controlId="first_name">
                                    <Form.Label>Imię</Form.Label>
                                    <Form.Control
                                        value={values.first_name}
                                        onChange={(e) => setField('first_name', e.target.value)}
                                        isInvalid={!!errors.first_name}
                                        placeholder="Twoje imię"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.first_name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Nazwisko */}
                                <Form.Group className="mb-3" controlId="last_name">
                                    <Form.Label>Nazwisko</Form.Label>
                                    <Form.Control
                                        value={values.last_name}
                                        onChange={(e) => setField('last_name', e.target.value)}
                                        isInvalid={!!errors.last_name}
                                        placeholder="Twoje nazwisko"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.last_name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Hasło */}
                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Hasło</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={values.password}
                                        onChange={(e) => setField('password', e.target.value)}
                                        isInvalid={!!errors.password}
                                        placeholder="Min. 8 znaków"
                                        autoComplete="new-password"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-flex align-items-center gap-2">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (<><Spinner size="sm" className="me-2" /> Rejestruję…</>) : 'Zarejestruj'}
                                    </Button>
                                    <div className="ms-auto">
                                        Masz konto? <Link to="/login">Zaloguj się</Link>
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    )
}