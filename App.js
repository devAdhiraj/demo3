import React, {Component, useEffect} from 'react';
import {SafeAreaView, View, StyleSheet, Text, StatusBar, Button, PermissionsAndroid} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {DeviceEventEmitter} from 'react-native';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import Contacts from 'react-native-contacts';
import SmsAndroid from 'react-native-get-sms-android';
class App extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      lastSms: "",
      prevSms: ""
    }
  }

  componentDidMount(){
    const Permission = async (permissionName) => {
      try {
      const granted = await PermissionsAndroid.request(
        permissionName,
        {
          title: "Sms reading",
          message: "Permssion To read SMS",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permission granted.");
        return true;
      } else {
        console.log("permission denied.");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  
  Permission(PermissionsAndroid.PERMISSIONS.READ_SMS);
  Permission(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);

}
  
  readContacts = () => {
    Contacts.getAll().then(contacts =>{console.log(contacts)});
  }

  componentDidUpdate(){
    // device event emitter used to
    let subscription = DeviceEventEmitter.addListener(
      'notificationClickHandle',
      function (e) {
        console.log('json', e);
      },
    );
    return function cleanup() {
      subscription.remove();
    };
  }

  onStart = () => {
        // Checking if the task i am going to create already exist and running, which means that the foreground is also running.
        if (ReactNativeForegroundService.is_task_running('taskid')) return;
        // Creating a task.
        ReactNativeForegroundService.add_task(() => {this.readSms()},
          {
            delay: 5000,
            onLoop: true,
            taskId: 'taskid',
            onError: (e) => console.log(`Error logging:`, e),
          },
        );

        // starting  foreground service.
        return ReactNativeForegroundService.start({
          id: 156,
          title: 'Foreground Service',
          message: this.state.lastSms,
        });
      }
    
      onStop = () => {
        // Make always sure to remove the task before stoping the service. and instead of re-adding the task you can always update the task.
        if (ReactNativeForegroundService.is_task_running('taskid')) {
          ReactNativeForegroundService.remove_task('taskid');
        }
        // Stoping Foreground service.
        return ReactNativeForegroundService.stop();
      }

      readSms = () => {
        
        var filter = {
          box: '', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
         
          /**
           *  the next 3 filters can work together, they are AND-ed
           *  
           *  minDate, maxDate filters work like this:
           *    - If and only if you set a maxDate, it's like executing this SQL query:
           *    "SELECT * from messages WHERE (other filters) AND date <= maxDate"
           *    - Same for minDate but with "date >= minDate"
           */
          minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)
          // maxDate: 1613934623, // timestamp (in milliseconds since UNIX epoch)
          // bodyRegex: '(.*)How are you(.*)', // content regex to match
         
          /** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
          // read: 0, // 0 for unread SMS, 1 for SMS already read
          // _id: 1234, // specify the msg id
          // thread_id: 7, // specify the conversation thread_id
          // address: '14373339554', // sender's phone number
          // body: 'How are you', // content to match
          /** the next 2 filters can be used for pagination **/
          // indexFrom: 0, // start from index 0
          maxCount: 1, // count of SMS to return each time
        };
    
        SmsAndroid.list(
          JSON.stringify(filter),
          (fail) => {
            console.log('Failed with this error: ' + fail);
          },
          (count, smsList) => {
            var arr = JSON.parse(smsList);
         
            arr.forEach(function(object) {
              this.setState({prevSms: object.body});
            }.bind(this));
            if(this.state.prevSms != this.state.lastSms){
              this.setState({lastSms: this.state.prevSms})
              if(ReactNativeForegroundService.is_task_running('taskid')){
              ReactNativeForegroundService.update({
                id: 156,
                title: 'Foreground Service',
                message: this.state.lastSms,
              });
            }
            }
            console.log(this.state.lastSms);
          },
          );
      }

  render(){
    return(
      <SafeAreaView
        style={{flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
          <Text>Last SMS: {this.state.lastSms}</Text>
        <Button title={'Start'} onPress={this.onStart} />
        <Button title={'Stop'} onPress={this.onStop} />
        <Button title={'Read all contacts'} onPress={this.readContacts} />
        <Button title={'read sms'} onPress={this.readSms} />


      </SafeAreaView>
    );
  }

}

export default App;