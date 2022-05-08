import React from 'react';
import axios from 'axios';

import { Button } from '@mantine/core';

axios.defaults.withCredentials = true;

export default class AnswerQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: '', user: '', errors: []};
        this.newPage = props.newPage
        this.qid = props.qid
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event, tar) {
        this.setState({[tar]: event.target.value});
    }
    handleSubmit(event) {
        const text = this.state.text
        event.preventDefault();
        const errors = []
        if (text === "") {
            errors.push("Post can't be empty")
        }
        if (errors.length > 0) {
            this.setState({errors: errors})
        } else {
            const newAnswer = {
                text: text,
                question: this.qid.slice(1)
            }
            axios.post(`http://localhost:8000/posts/question/${this.qid.slice(1)}`, newAnswer).then(() => {
                this.newPage(`q${this.qid.slice(1)}`)
            })
        }
    }
    render() {
        const errors = this.state.errors.map((value) => <li key={value}>{value}</li>)
        return (
                <>
                <ul id={'errors'}>{errors}</ul>
                <br/>
                <h1>Answer Text</h1>
                <label>
                    Add details
                    <br/><textarea value={this.state.value} onChange={(e) => this.handleChange(e, 'text')}/></label>
                <br/>
                <Button onClick={this.handleSubmit} type="submit">Submit</Button>
                </>
        );
    }
}
