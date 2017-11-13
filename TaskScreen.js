import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import {
  Container,
  Header,
  Content,
  Footer,
  FooterTab,
  Button,
  Icon,
  Text,
  Left,
  Body,
  Title,
  Right,
  List,
  ListItem,
  Switch,
  Card,
  CardItem
} from 'native-base';
import * as firebase from 'firebase';

export class TaskScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true
    };
  }

  // https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
  componentWillMount() {
    if (firebase.auth().currentUser) {
      firebase
        .database()
        .ref('task')
        .on('value', snapshot => {
          this.setState({ tasks: snapshot.val(), loading: false });
        });
    }
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Tasks',
    headerRight: (
      <Button transparent onPress={() => navigation.navigate('AddTask')}>
        <Text>Add Task</Text>
      </Button>
    ),
    headerLeft: (
      <Button transparent onPress={() => navigation.navigate('EditTask')}>
        <Text>Edit Task</Text>
      </Button>
    ),
    tabBarIcon: ({ tintColor, focused }) => (
      <Icon
        name={focused ? 'ios-list-box' : 'ios-list-box-outline'}
        style={{ color: tintColor }}
      />
    )
  });

  render() {
    if (!this.state.loading) {
      var tasks = [];

      if (this.state.tasks) {
        // checks null because Object.values fails on null
        tasks = Object.entries(this.state.tasks).reverse();
      }

      var listItems = [];

      for (const [key, task] of tasks) {
        listItems.push(
          <Card key={key}>
            <CardItem header>
              <Text>{task.task_title}</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>{task.tast_description}</Text>
              </Body>
            </CardItem>
          </Card>
        );
      }

      return (
        <Container style={styles.container}>
          <Content>{listItems}</Content>
        </Container>
      );
    } else {
      return <Text>Loading...</Text>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
});
