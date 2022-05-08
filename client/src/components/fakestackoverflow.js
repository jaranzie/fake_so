import React from 'react';
import axios from 'axios';
import {Button, Group, AppShell, Header, Title} from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { Register, Login, Welcome, Logout } from './welcome.js';
import AnswerQuestion from "./answerquestion";
import {BuildQuestions, AskQuestion, BuildAnswers, Profile} from "./questions.js"

axios.defaults.withCredentials = true;

export default class FakeStackOverflow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {page: 'welcome'}
    this.handlePageChange = this.handlePageChange.bind(this)
    this.setUser = this.setUser.bind(this)
  }
  setUser(userID) {
    this.setState({_id:userID})
    sessionStorage.setItem("user", userID)
  }

  handlePageChange(page)
  {
    if (this.state.page !== page) {
      sessionStorage.setItem("page", page)
      if (page === 'questions') {
        axios.get('http://localhost:8000/posts/questions').then(response => {
          this.setState({page:page, pageData:response.data})
        });
      } else if (page === 'tags') {
        axios.get('http://localhost:8000/posts/tags').then(response => {
          this.setState({page:page, pageData:response.data})
        });
      } else if (page === 'profile') {
        axios.get('http://localhost:8000/profile').then(response => {
          this.setState({page:page, pageData:response.data})
        });
      } else if (page === 'ask') {
        this.setState({page:page})
      } else if (page[0] === 't') {
        axios.get(`http://localhost:8000/posts/tag/${page.slice(1)}`).then(response => {
          this.setState({page:page, pageData:response.data})})

      } else if (page[0] === 'q') {
        axios.get(`http://localhost:8000/posts/question/${page.slice(1)}`).then(response => {
          this.setState({page:page, pageData:response.data})
        });
      } else if (page[0] === 'a') {
        this.setState({page:page})
      } else if (page[0] === '?') {
        let searchText = page.slice(2).toLowerCase()
        if (searchText.length === 0) {
          this.setState({page:page, pageData:[]})
        }
        const tags = []
        while (searchText.indexOf('[') !== -1 && searchText.indexOf(']') !== -1) {
          tags.push(searchText.slice(searchText.indexOf('[') + 1, searchText.indexOf(']')))
          searchText = searchText.slice(searchText.indexOf(']') + 1)
        }
        searchText = searchText.trim()
        const search = {
          tags:tags,
          searchText:searchText
        }
        axios.post('http://localhost:8000/posts/questions/search', search).then(response => {
          this.setState({page:page, pageData:response.data})
        })
      } else {
          this.setState({page:page})
      }
    }
  }

  componentDidMount() {

    if (sessionStorage.getItem("page")) {
      // Restore the contents of the text field
      this.handlePageChange(sessionStorage.getItem("page"));
      if (sessionStorage.getItem("user")) {
        // Restore the contents of the text field
        this.setState({_id:sessionStorage.getItem("user")});
      }
    }

  }

  render() {
    if (this.state.page === 'welcome'){
      return (<Welcome newPage={this.handlePageChange}/>)}
    else if (this.state.page === 'register'){
      return (<Register newPage={this.handlePageChange}/>)}
    else if (this.state.page === 'login'){
      return (<Login setUser={this.setUser} newPage={this.handlePageChange}/>)}
    return (
        <NotificationsProvider>
              <AppShell fixed header={<Banner setUser={this.setUser} page={this.state.page}  newPage={this.handlePageChange} user={this.state._id}/>}>
                <MainBody page={this.state.page}  newPage={this.handlePageChange} data={this.state.pageData}/>
              </AppShell>
          </NotificationsProvider>

      )
  }
}

function TagBox(props) {
  return <div className={'tag-box'}><a
      onClick={() => props.newPage(`t${props.value._id}`)}> {props.value.name}</a><br/> {`${props.value.numQuestions} questions`}
  </div>
}

function Banner(props) {
  if (props.user) {
    return (
        <Header height={70} p="md">
          <Group position="center" spacing="lg">
            <Button onClick={() => props.newPage('questions')}>Questions</Button>
            <Button onClick={() => props.newPage('tags')}>Tags</Button>
            <Title onClick={() => props.newPage('welcome')} order={1}>Fake_so</Title>
            <Button onClick={() => props.newPage('profile')} >Profile</Button>
            <Button onClick={() => props.newPage('ask')} >Ask a question</Button>
            <Logout setUser={props.setUser} newPage={props.newPage}/>
            <input type="text" placeholder="Search ..." id="search-box" className="banner" onKeyDown={(e) => {e.key === 'Enter' && props.newPage(`? ${e.target.value}`)}}/>
          </Group>
        </Header>)
  }
  return (
      <Header height={70} p="md">
        <Group position="center" spacing="lg">
          <Button onClick={() => props.newPage('questions')}>Questions</Button>
          <Button onClick={() => props.newPage('tags')}>Tags</Button>
          <Title onClick={() => props.newPage('welcome')} order={1}>Fake_so</Title>
          <input type="text" placeholder="Search ..." id="search-box" className="banner" onKeyDown={(e) => {e.key === 'Enter' && props.newPage(`? ${e.target.value}`)}}/>
        </Group>
      </Header>
)
}
function MainBody(props) {
  const page = props.page
  const pageData = props.data
  if (page === 'questions') {
    return (<div id={"main"}>
      <BuildQuestions questions={pageData} title={"All Questions"} newPage={props.newPage}/>
    </div>)
  }
  else if (page === 'profile') {
    console.log(pageData)
    return (<>
      <Profile user={pageData.user} />
      <Title>Your Questions</Title>
        <div id={"main"}>
      <BuildQuestions questions={pageData.questions} title={"All Questions"} newPage={props.newPage}/>
    </div>
    </>)
  }
  else if (page === 'tags') {
    const tagBoxes = pageData.map(function (value, index) {
      if (index % 3 === 0) {
        return <><br/><TagBox value={value} newPage={props.newPage}/> </>
      }
      return <TagBox value={value} newPage={props.newPage}/>
    })
    return (<div id={"main"}>
      <ul id={"questions-page-header"}>
        <li> {pageData.length} Tags</li>
        <li id={"center-item"}> <Title> All tags </Title></li>
        <li>
        </li>
      </ul>
      <br/><br/>{tagBoxes}

    </div>)
  }
  else if (page === 'ask') {
    return (<div id={"main"}>
      <AskQuestion newPage={props.newPage}/>
    </div>)
  }
  else if (page[0] === 't') {
    const tag = pageData[0].tags.find((r) => {
      if (r._id === page.slice(1)) {return r}
    })
    return (<div id={"main"}>
      <BuildQuestions questions={pageData} title={`Questions tagged ${tag.name}`}
                      newPage={props.newPage}/>
    </div>)
  }
  else if (page[0] === 'q') {
    return <BuildAnswers question={pageData} newPage={props.newPage}/>
  }
  else if (page[0] === 'a') {
    return (<div id={"main"}>
      <AnswerQuestion newPage={props.newPage} qid={page}/>
    </div>)
  }
  else if (page[0] === '?') {
    //check how many results for title
    let title;
    if (pageData.length === 0) {title='No Results Found'}
    else {title='Search Results'}
    return (<div id={"main"}>
      <BuildQuestions questions={pageData} title={title} newPage={props.newPage}/>
    </div>)
  }
}

