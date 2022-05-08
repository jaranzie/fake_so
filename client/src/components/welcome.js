import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import {Stack, TextInput, Button, Box, Group, Space, Center, PasswordInput} from '@mantine/core';
import {showNotification} from "@mantine/notifications";
axios.defaults.withCredentials = true;

export function Register(props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const submit = () => {
        if (username.length > 0 && password.length > 0 && email.length > 0 && passwordError === '' && usernameError === '' && emailError === '') {
            const newUser = {
                username: username,
                email: email,
                password: password,
            }
            axios.post('http://localhost:8000/newUser', newUser).then(response => {
                props.newPage('login')
            }).catch(error => {
                if(error.response) {
                    setEmailError('Email Already In Use')
                }
            })
        }
        else {
            if (email.length < 1) {
                setEmailError('Email Required')
            }
            if (username.length < 1) {
                setUsernameError('Username Required')
            }
            if (password.length < 1) {
                setPasswordError('Password Required')
            }
        }
    }
    return (
        <Box sx={{ maxWidth: 340 }} mx="auto">
                <TextInput value={email} onChange={(event) => {
                    const em = event.currentTarget.value
                    setEmail(em)
                    if (validateEmail(em)) {
                        setEmailError('')
                    }
                    else {
                        setEmailError('Enter Valid Email')
                    }
                }
                }
                    required
                    label="Email"
                    placeholder="example@mail.com"
                    type="email"
                    error={emailError}
                />
                <TextInput value={username} onChange={(event) => {
                    const un = event.currentTarget.value
                    setUsername(un)
                    if (un.length < 1) {
                        setUsernameError('Username Required')
                    }
                    else {
                        setUsernameError('')
                    }
                }}
                    placeholder="Input Username"
                    label="Username"
                    error={usernameError}
                    required
                />
                <PasswordInput value={password} onChange={(event) => {
                    const pw = event.currentTarget.value
                    setPassword(pw)
                    if (pw.length < 1) {
                        setPasswordError('Password Required')
                    }
                    else if (pw.includes(username) || (emailError === '' && pw.includes(email.substring(0,email.indexOf('@'))))) {
                        setPasswordError('Password Cannot Contain Username or Email')
                    }
                    else {
                        setPasswordError('')
                    }
                }}
                    required
                    label="Password"
                    placeholder="SuperCoolPassword"
                    mt="sm"
                    type={"password"}
                    error={passwordError}
                />

                <Group position="right" mt="xl">
                    <Button onClick={submit} type="submit">Submit</Button>
                </Group>
        </Box>
    );
}
function validateEmail(email) {
    const matchText = /^.+@.+$/
    return matchText.test(email)
}

export function Welcome(props) {
    return (
        <Center>
        <Stack spacing="lg" sx={{ width: 340 }}>
                <Space h="lg" />
                <Button onClick={() => props.newPage('register')} type="submit">Register</Button>
                <Space h="lg" />
                <Button onClick={() => props.newPage('login')} type="submit">Login</Button>
                <Space h="lg" />
                <Button onClick={() => props.newPage('questions')} type="submit">Continue as Guest</Button>
        </Stack>
        </Center>
    )
}

export function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const submit = () => {
        if (passwordError === '' && emailError === '') {
            const loginCreds = {
                email: email,
                password: password
            }
            axios.post('http://localhost:8000/login', loginCreds).then(response => {
                props.newPage('questions')
                props.setUser(response.data._id)
            }).catch(error => {
                if(error.response) {
                    setEmailError('Incorrect Email or Password')
                }
            })
        }
    }
    return (
        <Box sx={{ maxWidth: 340 }} mx="auto">
            <TextInput value={email} onChange={(event) => {setEmailError(''); setEmail(event.currentTarget.value)}}
                       required
                       label="Email"
                       placeholder="example@mail.com"
                       type="email"
                       error={emailError}
            />
            <PasswordInput value={password} onChange={(event) => {setPasswordError('');setPassword(event.currentTarget.value)}}
                       required
                       label="Password"
                       placeholder="SuperCoolPassword"
                       mt="sm"
                       type={"password"}
                       error={passwordError}
            />
            <Group position="right" mt="xl">
                <Button onClick={submit} type="submit">Submit</Button>
            </Group>
        </Box>
    );
}

export function Logout(props) {
    const logout = () => {

        axios.post('http://localhost:8000/logout').then(res => {
            sessionStorage.removeItem("user")
            sessionStorage.removeItem("page")
            props.newPage('welcome')
            props.setUser(undefined)
        }).catch(err => {
            if (err.response) {
                showNotification({
                    title: 'Logout Unsuccessful',
                    message: 'You couldn\'t be logged out 🤥',
                })
            }
        })
    }
    return (
        <Button onClick={logout} type="submit">
            Logout
        </Button>
    )
}

