# SMS Continuity and Background Process (Foreground Service) in React Native

So it uses [this npm library](https://www.npmjs.com/package/@supersami/rn-foreground-service) to run in foreground, so you can find the proper documentation in that link.

Basically if you want to add a background task, you can either change the readSms function so that it also does your task or you can add your own task by creating a different foreground service task. Something like this - 

```
ReactNativeForegroundService.add_task(() => console.log("I am Being Tested"), {
  delay: 100,
  onLoop: true,
  taskId: "taskid",
  onError: (e) => console.log(`Error logging:`, e),
});
```
