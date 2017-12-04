import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import {
  Container,
  Header,
  Content,
  Button,
  Form,
  Item,
  Input,
  Label,
  Text,
  ListItem,
  CheckBox,
  Body,
  //new ss
  Icon,
  Title,
  Right,
  Segment,
  List,
  View
} from 'native-base';
import ActionButton from 'react-native-action-button';
import * as firebase from 'firebase';

export class BillScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      onList: true
    };
  }
  static navigationOptions = ({ navigation }) => ({
    title: 'Bills',
    headerTintColor: '#c02b2b',

    tabBarIcon: ({ tintColor, focused }) => (
      <Icon
        name={focused ? 'ios-cash' : 'ios-cash-outline'}
        style={{ color: tintColor }}
      />
    )
  });

  getExcess(userID) {
    let sumPaid = 0.0;
    let sumOwed = 0.0;
    let excess = 0.0;
    const billCreated = this.props.screenProps.state.bills
      .filter(bill => bill.requester === userID)
      .map(bill => (sumPaid += parseInt(bill.amount.substring(1))));
    const billInvolved = this.props.screenProps.state.bills
      .filter(bill => {
        return userID in bill.users;
      })
      .map(
        bill =>
          (sumOwed +=
            parseInt(bill.amount.substring(1)) /
            parseInt(Object.keys(bill.users).length)) // +1 includes the requester MOD THIS ACCORDING TO UDPATED TEST
      );
    excess = sumOwed - sumPaid;
    // if negative then they're in deficit, people owe this person money.
    // if positive then they're in excess, they owe money to people.
    return excess;
  }

  // start ss
  getUserAmounts() {
    return this.props.screenProps.state.users.map(user =>
      this.getExcess(user.id)
    );
  }

  // end

  getPersonalTotal() {
    if (this.getExcess(this.props.screenProps.state.user.uid) < 0) {
      //const listofAmounts = this.getUserAmounts();
      //const transactionsArr = this.getTransactions(listofAmounts);
      //return this.printTransactions(transactionsArr);
      //BEST ONE
      return (
        'Your housemates owe you $' +
        this.getExcess(this.props.screenProps.state.user.uid) +
        ' total!'
      );
    } else if (this.getExcess == 0) {
      return 'You are in perfect balance!';
    } else {
      return (
        'You owe your housemates $' +
        Math.abs(this.getExcess(this.props.screenProps.state.user.uid)) +
        ' total!'
      );
    }
    // check to see if theyre in excess or deficit, display that number.
    // if in excess then display the amount that other users in the dojo owe them.
    // if in deficit then display the amount that they owe other users in the dojo.
  }
  createList(array) {
    const { navigate } = this.props.navigation;
    var list = array.map(bill => (
      <ListItem
        key={bill.id}
        onPress={() => navigate('BillDetails', { bill: bill })}>
        <Text>{bill.title}</Text>
      </ListItem>
    ));

    return list;
  } // creates an object of list items from array //

  // decide which view to show
  showBills(involvingMe, assignedByMe) {
    if (involvingMe.length > 0 && assignedByMe.length > 0) {
      return (
        <View>
          <ListItem itemDivider>
            <Text>Involving Me </Text>
          </ListItem>
          {this.createList(involvingMe)}
          <ListItem itemDivider>
            <Text>Assigned By Me </Text>
          </ListItem>
          {this.createList(assignedByMe)}
        </View>
      );
    } else if (involvingMe.length > 0) {
      return (
        <View>
          <ListItem itemDivider>
            <Text>Involving Me</Text>
          </ListItem>
          {this.createList(involvingMe)}
        </View>
      );
    } else if (assignedByMe.length > 0) {
      return (
        <View>
          <ListItem itemDivider>
            <Text>Assigned By Me</Text>
          </ListItem>
          {this.createList(assignedByMe)}
        </View>
      );
    } else {
      return <Text> No Bills to Display :( </Text>;
    }
  }
  // new ------------------------------------------------------------------------------------------

  // returns a list of transactions that would settle a given excess list.
  // returns a 2D array that represents person {i} should pay person {j}
  // {arr[i][j]} dollars
  getTransactions(EXCESS_LIST) {
    if (!this.validateExcessList(EXCESS_LIST)) {
      return;
    }

    // clones it so we don't modify the original
    let excessList = EXCESS_LIST.slice();
    let transactions = this.zeroFill2DArray(excessList.length);

    // while the excess list is not settled, have the person who owns the most
    // money pay the person who is owed the most money and add it to transactions
    while (!this.settled(excessList)) {
      const receiver = this.mostOwed(excessList);
      const sender = this.mostOwned(excessList);
      excessList[receiver] += excessList[sender];
      transactions[sender][receiver] += excessList[sender];
      excessList[sender] = 0;
    }

    return transactions;
  }

  validateExcessList(excessList) {
    let sum = 0;
    for (let i = 0; i < excessList.length; i++) {
      sum += excessList[i];
    }
    return sum === 0;
  }

  // returns a clone of a given 2D array
  clone2DArray(arr) {
    let clone = [];
    for (let i = 0; i < arr.length; i++) {
      clone[i] = [];
      for (let j = 0; j < arr.length; j++) {
        clone[i][j] = arr[i][j];
      }
    }
    return clone;
  }

  // returns a 2D array of 0s of a given size
  zeroFill2DArray(size) {
    let arr = [];
    for (let i = 0; i < size; i++) {
      arr[i] = [];
      for (let j = 0; j < size; j++) {
        arr[i][j] = 0;
      }
    }
    return arr;
  }

  // returns true if a given array is all 0s, false otherwise
  settled(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  // returns the index of the minimum number in a given array
  mostOwed(arr) {
    let index = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < arr[index]) {
        index = i;
      }
    }
    return index;
  }

  // returns the index of the maximum number in a given array
  mostOwned(arr) {
    let index = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > arr[index]) {
        index = i;
      }
    }
    return index;
  }

  printTransactions(transactions) {
    for (let i = 0; i < transactions.length; i++) {
      for (let j = 0; j < transactions.length; j++) {
        if (transactions[i][j] !== 0) {
          console.log(
            `${this.props.screenProps.state.users[i].name} should pay ${
              this.props.screenProps.state.users[j].name
            } ${transactions[i][j]} dollars.`
          );
        }
      }
    }
  }

  listTransactions(transactions) {
    let list = [];
    for (let i = 0; i < transactions.length; i++) {
      for (let j = 0; j < transactions.length; j++) {
        if (transactions[i][j] !== 0) {
          list.push(
            `${this.props.screenProps.state.users[i].name} should pay ${
              this.props.screenProps.state.users[j].name
            } ${transactions[i][j]} dollars.`
          );
        }
      }
    }
    return list.map((str, index) => <Text key={index}>{str}</Text>);
  }

  // end new --------------------------------------------------------------------------------------
  render() {
    const excessList = this.getUserAmounts();
    //this.printTransactions(this.getTransactions(excessList));
    const { navigate } = this.props.navigation;
    /*const bills = this.props.screenProps.state.bills.map(bill => (
      <ListItem
        key={bill.id}
        onPress={() => navigate('BillDetails', { bill: bill })}>
        <Text>{bill.title}</Text>
      </ListItem>
    ));*/

    // build array of bills assigned by me
    const assignedByMeArray = this.props.screenProps.state.bills.filter(
      bill => {
        return bill.requester === this.props.screenProps.state.user.uid;
      }
    );

    // build array of bills assigned to me
    const involvingMeArray = this.props.screenProps.state.bills.filter(bill => {
      var uid = this.props.screenProps.state.user.uid;
      return bill.users[uid];
    });

    const listBill = (
      <Content>
        <Container style={styles.container}>
          <Content>
            <List>{this.showBills(involvingMeArray, assignedByMeArray)}</List>
          </Content>
        </Container>
      </Content>
    );

    const personalTotal = (
      <Content>
        <Container style={styles.container}>
          <Content>
            <Text>{this.getExcess(this.props.screenProps.state.user.uid)}</Text>
            <Text>{this.getPersonalTotal()}</Text>
            {this.validateExcessList(excessList) ? (
              this.listTransactions(this.getTransactions(excessList))
            ) : (
              <Text>Loading</Text>
            )}
            <View style={styles.center}>
              <Button style={styles.checkOff}>
                <Text>Check Off Bill</Text>
              </Button>
            </View>
          </Content>
        </Container>
      </Content>
    );
    return (
      <Container style={styles.container}>
        <Header hasTabs style={styles.segment}>
          <Segment style={styles.segment}>
            <Button
              style={{
                backgroundColor: this.state.onList ? '#c02b2b' : undefined,
                borderColor: '#c02b2b'
              }}
              first
              active={this.state.onList}
              onPress={() => {
                if (!this.state.onList) {
                  this.setState({ onList: true });
                }
              }}>
              <Text style={{ color: this.state.onList ? '#FFF' : '#c02b2b' }}>
                List of Bills
              </Text>
            </Button>
            <Button
              last
              style={{
                backgroundColor: !this.state.onList ? '#c02b2b' : undefined,
                borderColor: '#c02b2b'
              }}
              active={!this.state.onList}
              onPress={() => {
                if (this.state.onList) {
                  this.setState({ onList: false });
                }
              }}>
              <Text style={{ color: !this.state.onList ? '#FFF' : '#c02b2b' }}>
                Personal Totals
              </Text>
            </Button>
          </Segment>
        </Header>
        {this.state.onList ? listBill : personalTotal}
        <ActionButton
          buttonColor="#c02b2b"
          onPress={() => navigate('AddBill')}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  segment: {
    backgroundColor: 'white'
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  },
  center: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  checkOff: {
    alignSelf: 'center',
    backgroundColor: '#c02b2b'
  }
});
