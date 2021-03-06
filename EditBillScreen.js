import React, { Component } from "react";
import { StyleSheet, Alert, Keyboard } from "react-native";
import { NavigationActions } from "react-navigation";
import DatePicker from "react-native-datepicker";
import {
  Container,
  Header,
  Content,
  Button,
  Form,
  Item,
  Input,
  Label,
  Left,
  ListItem,
  CheckBox,
  Text,
  Body,
  Thumbnail,
  View
} from "native-base";
import * as firebase from "firebase";

export class EditBillScreen extends React.Component {
  static navigationOptions = {
    title: "Edit Bill"
    // headerTintColor: '#c02b2b'
  };

  constructor(props) {
    super(props);
    var users = {};
    for (const user of this.props.screenProps.state.users) {
      users[user.id] = true;
    }

    var billField = this.props.navigation.state.params.bill;
    this.state = {
      billTitle: billField.title,
      billAmount: billField.amount,
      billDescription: billField.description,
      date: billField.date,
      billUsers: billField.users
    };
  }

  editBill() {
    var key = this.props.navigation.state.params.bill.id;

    firebase
      .database()
      .ref("bills")
      .child(key)
      .update({
        amount: this.state.billAmount,
        date: this.state.date,
        description: this.state.billDescription,
        requester: this.props.screenProps.state.user.uid,
        users: this.state.billUsers,
        title: this.state.billTitle
      });

    firebase
      .database()
      .ref("dojos")
      .child(this.props.screenProps.state.dojo)
      .child("bills")
      .child(key)
      .remove();

    firebase
      .database()
      .ref("dojos")
      .child(this.props.screenProps.state.dojo)
      .child("bills")
      .update({ [key]: true });
  }

  usersCount() {
    let count = 0;
    for (const user of Object.values(this.state.billUsers)) {
      if (user) count++;
    }
    return count;
  }

  toggleCheck(bool, user) {
    console.log(bool);
    if (bool) {
      return <Thumbnail small source={require("./checkmark.png")} />;
    } else {
      return <Thumbnail small source={{ uri: user.photoURL }} />;
    }
  }

  formatAmount(text) {
    var txtLen = text.length - 1;
    var check = text;

    if (check.charAt(txtLen) < "0" || check.charAt(txtLen) > "9") {
      check = check.substr(0, txtLen);
    }

    check = check.replace(/[^0-9]/g, "");
    var accounting = require("accounting");
    return accounting.formatMoney(parseFloat(check) / 100);
  }

  render() {
    const users = this.props.screenProps.state.users.map(user => (
      <ListItem
        key={user.id}
        onPress={() => {
          var prevUsers = this.state.billUsers;
          prevUsers[user.id] = !prevUsers[user.id];
          this.setState({
            users: prevUsers
          });
        }}
      >
        {this.toggleCheck(this.state.billUsers[user.id], user)}
        <Body>
          <Text>{user.name}</Text>
        </Body>
      </ListItem>
    ));

    return (
      <Container style={styles.container}>
        <Content>
          <Form>
            <Item fixedLabel style={styles.inputItem}>
              <Label>Bill Title</Label>
              <Input
                value={this.state.billTitle}
                onChangeText={text => this.setState({ billTitle: text })}
              />
            </Item>
            <Item fixedLabel style={styles.inputItem}>
              <Label>Amount</Label>
              <Input
                keyboardType={"numeric"}
                style={styles.right}
                onChangeText={text =>
                  this.setState({ billAmount: this.formatAmount(text) })
                }
                value={this.state.billAmount}
              />
            </Item>
            <Item fixedLabel style={styles.inputItem}>
              <Label>Description</Label>
              <Input
                value={this.state.billDescription}
                onChangeText={text => this.setState({ billDescription: text })}
              />
            </Item>

            <Item fixedLabel style={styles.inputItem}>
              <Label>Due Date</Label>
              <Text
                style={styles.text}
                onPress={() => {
                  this.refs.datepicker.onPressDate();
                }}
              >
                {this.state.date}
              </Text>
            </Item>
            <DatePicker
              format="MM-DD-YYYY"
              date={this.state.date}
              mode="date"
              style={{ width: 0, height: 0 }}
              showIcon={false}
              confirmBtnText="Submit"
              cancelBtnText="Cancel"
              //customStyles={customStyles}
              ref="datepicker"
              onDateChange={date => {
                this.setState({ date: date });
              }}
            />

            <ListItem itemDivider>
              <Body>
                <Text>Users</Text>
              </Body>
            </ListItem>
            {users}
          </Form>

          <View style={styles.view}>
            <Button
              full
              style={styles.button}
              onPress={() => {
                console.log("usercount = " + this.usersCount());
                if (this.state.billTitle === "") {
                  Alert.alert("Submission Failed", "Title cannot be empty.");
                } else if (this.state.billAmount === "$0.00") {
                  Alert.alert(
                    "Submission Failed",
                    "Your Bill Amount cannot be $0.00"
                  );
                } else if (this.usersCount() === 0) {
                  Alert.alert(
                    "Submission Failed",
                    "At least one user must be involved."
                  );
                } else if (this.usersCount() === 0) {
                  Alert.alert(
                    "Submission Failed",
                    "At least one user must be involved."
                  );
                } else {
                  Keyboard.dismiss();
                  this.editBill();
                  this.props.navigation.dispatch(
                    NavigationActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({ routeName: "Bills" })
                      ]
                    })
                  );
                }
              }}
            >
              <Text>Save</Text>
            </Button>
          </View>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  right: {
    marginRight: 20,
    textAlign: "right"
  },
  container: {
    backgroundColor: "white"
  },
  button: {
    // marginTop: 30,
    backgroundColor: "#c02b2b"
  },
  view: {
    flex: 1
    // flexDirection: 'row',
    // justifyContent: 'center'
  },
  text: {
    marginTop: 17,
    marginBottom: 17,
    marginRight: 25
  },
  inputItem: {
    marginLeft: 0,
    paddingLeft: 15
  }
});
