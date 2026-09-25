import { PushNotifications } from "@capacitor/push-notifications"

export async function initPushNotifications() {
  console.log("PUSH: init started")

  PushNotifications.addListener("registration", (token) => {
    console.log("FCM TOKEN:", token.value)
    alert(`FCM TOKEN: ${token.value}`)
  })

  PushNotifications.addListener("registrationError", (error) => {
    console.error("PUSH registration error:", error)
    alert(`PUSH REG ERROR: ${JSON.stringify(error)}`)
  })

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("PUSH received:", notification)
  })

  PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
    console.log("PUSH action:", notification)
  })

  let permStatus = await PushNotifications.checkPermissions()
  console.log("PUSH: checkPermissions =", permStatus)

  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions()
    console.log("PUSH: requestPermissions =", permStatus)
  }

  if (permStatus.receive !== "granted") {
    console.log("PUSH: permission not granted")
    alert("PUSH PERMISSION NOT GRANTED")
    return
  }

  console.log("PUSH: registering")
  await PushNotifications.register()
}