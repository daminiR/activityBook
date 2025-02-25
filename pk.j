{
  "name": "sport",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd mobile and npm run android\"",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/daminiR/sport.git"
  },
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/daminiR/sport/issues"
  },
  "homepage": "https://github.com/daminiR/sport#readme",
  "dependencies": {
    "@react-native-community/push-notification-ios": "^1.10.1",
    "concurrently": "^5.3.0",
    "faker": "^6.6.6",
    "react-devtools": "^4.22.1",
    "react-native-keychain": "^8.1.1",
    "react-native-push-notification": "^8.1.1",
    "yup": "^0.32.11"
  },
  "devDependencies": {
    "typescript": "^4.1.3"
  },
  "packageManager": "yarn@3.1.1"
}
