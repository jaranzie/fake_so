import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import {
    Stack,
    TextInput,
    Button,
    Box,
    Group,
    Badge, Title, Text, Grid, Textarea
} from '@mantine/core';
import {showNotification} from "@mantine/notifications";

axios.defaults.withCredentials = true;

export function AskQuestion(props) {

    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');

    const [summary, setSummary] = useState('');
    const [summaryError, setSummaryError] = useState('');

    const [text, setText] = useState('');

    const [tags, setTags] = useState('');
    const [tagsError, setTagsError] = useState('');

    const submit = () => {
        if (title.length > 0 && summary.length > 0 && titleError === '' && summaryError === '' && tagsError === '') {
            let tagArray = tags.split(' ')
            const newQuestion = {
                title: title,
                text: text,
                tagArray: tagArray,
                summary: summary
            }
            axios.post('http://localhost:8000/posts/question', newQuestion).then(response => {
                props.newPage('questions')
            }).catch(error => {
                if(error.response) {
                    setTagsError('You don\'t have enough points to make a new tag')
                }
            })
        }
    }

    return (
        <Box sx={{ maxWidth: 720 }} mx="auto">
        <TextInput value={title} onChange={(event) => {
            const un = event.currentTarget.value
            setTitle(un)
            if (un.length < 1) {
                setTitleError('Title Required')
            }
            else if (un.length > 50) {
                setTitleError('Title cannot be more than 50 characters')
            }
            else {
                setTitleError('')
            }
        }}
                   placeholder="Input Title"
                   label="Title"
                   error={titleError}
                   required
        />
    <TextInput value={summary} onChange={(event) => {
        const un = event.currentTarget.value
        setSummary(un)
        if (un.length < 1) {
            setSummaryError('Summary Required')
        }
        else if (un.length > 140) {
            setSummaryError('Summary limited to 140 characters')
        }
        else {
            setSummaryError('')
        }
    }}
               placeholder="Input Summary"
               label="Summary"
               error={summaryError}
               required
    />
            <TextInput value={tags} onChange={(event) => {
                const un = event.currentTarget.value
                setTags(un)
                setTagsError('')
            }}
                       placeholder="Input Tags"
                       label="Tags"
                       error={tagsError}
                       required
            />
            <Textarea
                placeholder="Text"
                label="Text"
                required
                autosize
                minRows={4}
                onChange={(event) => {
                    const un = event.currentTarget.value
                    setText(un)
                }}
            />
            <Group position="right" mt="xl">
                <Button onClick={submit} type="submit">Submit</Button>
            </Group>
            </Box>
    )

}


export function BuildQuestions(props) {
    const rows = []
    const [pageNum, setPageNum] = useState(1)
    const [next, setNext] = useState(props.questions.length > 5)
    const [prev, setPrev] = useState(false)
    const maxPage = Math.floor((props.questions.length + 5)/5)
    const prevButton = () => {
        if (pageNum === 2) {
            setPrev(false)
        }
        setPageNum(pageNum-1)
        setNext(true)
    }
    const nextButton = () => {
        if (pageNum + 1 === maxPage) {
            setNext(false)
        }
        setPageNum(pageNum+1)
        setPrev(true)
    }
    props.questions.forEach((question) =>
        rows.push(<QuestionRow key={question._id} question={question} newPage={props.newPage}/>))
    return <>
        {/*<ScrollArea>*/}
        {rows.splice((pageNum-1) * 5, (pageNum * 5))}
    {/*</ScrollArea>*/}
        <Group position="center" spacing="lg">
            <Button onClick={prevButton} disabled={!prev} variant="outline" compact>
                Prev
            </Button>
            <Button onClick={nextButton} disabled={!next} variant="outline" compact>
                Next
            </Button>
        </Group>
    </>

}
function QuestionRow(props) {
    return <Grid columns={10}>
        <Grid.Col span={2}><Stack align="flex-start" spacing="xs">
            {props.question.views} Views <br/> {props.question.answers.length} Answers<br/> {props.question.votes} Votes
        </Stack></Grid.Col>
            <Grid.Col span={6}><QuestionRowTitle question={props.question} newPage={props.newPage}/></Grid.Col>
                <Grid.Col span={2}><QuestionDetails question={props.question}/> </Grid.Col>
        <hr/>
    </Grid>
}
function QuestionDetails(props) {
    const date = new Date(props.question.ask_date_time)
    return <div>
        Asked By {props.question.asked_by.username} <br/> On {date.toDateString().slice(4)} <br/> {date.toTimeString().slice(0,5)}
    </div>
}
function QuestionRowTitle(props) {
    const tagBlocks = props.question.tags.map((value) => {
        return <Badge color="red">{value.name}</Badge>
    })
    return <Stack align="flex-start">
            <Title order={1} onClick={() => props.newPage(`q${props.question._id}`)}> {props.question.title}</Title>
            <Text color="blue">{props.question.summary}</Text>
            <ul> {tagBlocks} </ul>
    </Stack>
}

export function BuildAnswers(props) {
    let logged_in = false
    if (sessionStorage.getItem("user")) {
        logged_in = true
    }
    const downvote = () => {
        axios.post(`http://localhost:8000/posts/question/${props.question._id}/downvote`).then(res => {
            showNotification({
                title: 'Vote Successful',
            })
        }).catch(err => {
            if (err.response) {
                showNotification({
                    title: 'Vote Unsuccessful',
                    message: 'You don\'t have enough points 🤥',
                })
            }
        })
    }
    const upvote = () => {
        axios.post(`http://localhost:8000/posts/question/${props.question._id}/upvote`).then(res => {
            showNotification({
                title: 'Vote Successful',
            })
        }).catch(err => {
            if (err.response) {
                showNotification({
                    title: 'Vote Unsuccessful',
                    message: 'You don\'t have enough points 🤥',
                })
            }
        })
    }
    const tagBlocks = props.question.tags.map((value) => {
        return <Badge color="red">{value.name}</Badge>
    })
    const answers = props.question.answers.map((value) => {
        const answer = value
        return <div key={answer._id}>
            <div className={"ans-column"}> {answer.text} </div>
            <AnswerDetails answer={answer}/>
            <hr/>
        </div>
    })
    return <div id={"main"}>
        <ul id={"questions-page-header"}>
            <li> {props.question.answers.length} Answers</li>
            <li id={"center-item"}> {props.question.title} </li>
            <li>
                {props.question.views} Views
            </li>
        </ul>
        <br/><br/>
        <div className={'questions'}>
            <div className={"left-column"}><QuestionDetails question={props.question}/> <Text>{props.question.votes} Votes</Text> </div>
            <div className={"center-column"}>{props.question.text}
                <ul> {tagBlocks} </ul></div>
            <div className={"right-column"}>
            <Button onClick={upvote} disabled={!logged_in} color="green" radius="xl" size="xs" compact>
                Upvote
            </Button>
                <Button onClick={downvote} disabled={!logged_in} color="red" radius="xl" size="xs" compact>
                    Downvote
                </Button>
            </div>

            <hr/>
        </div>
        {answers}
        <Button disabled={!logged_in} onClick={() => props.newPage(`a${props.question._id}`)}> Answer Question
        </Button>
    </div>
}
function AnswerDetails(props) {
    const date = new Date(props.answer.ans_date_time)
    return <div className={"right-column"}>
        Ans By {props.answer.ans_by} <br/> On {date.toDateString().slice(4)} <br/> {date.toTimeString().slice(0, 5)}
    </div>
}

export function Profile(props) {


    return (<>
    <Title>{props.user.username}</Title>
        <Title>{props.user.points} Points</Title>
</>)
}
