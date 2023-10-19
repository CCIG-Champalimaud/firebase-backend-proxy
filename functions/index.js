/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started




// const functions = require('firebase-functions')
const {onRequest} = require("firebase-functions/v2/https")
// const logger = require("firebase-functions/logger");
const admin = require('firebase-admin')

const express = require('express')
const proxy = require('express-http-proxy')


// Define a function to set up your app with proxies based on Remote Config
const setupApp = async () => {
    
    try {
        //init express
        const app = express()
        //init admin firebase
        admin.initializeApp()
        //init Remote Config
        const remoteConfig = admin.remoteConfig()
        //get template of the remoteConfig and retrieve the data stored there
        const template = await remoteConfig.getTemplate()
        //this assumes there is a "proxies" parameter in RemoteConfig of the app set as json object
        const proxiesString = template.parameters['proxies'].defaultValue.value
        //json objects are stored as strings so they must be parsed first
        const proxies = JSON.parse(proxiesString)
        //create a proxy routing for each of the proxies defined in remoteConfig ex. proxies: {"/somewhere": "https://somewhere.else.com"}
        for (const [key, value] of Object.entries(proxies)) {
            //express routing (all methods, get post, etc..)
            app.use(key, proxy(value))
        }

    } catch (error) {
        //consider using the firebase logger utility
        console.error('Error setting up app:', error)
    }
}

//the express app will be available on projectAdress/app (export diferent name to have a diferent location)
//the async is to make sure that setupApp can be completed before returning the app (otherwise the endpoints will not be available on first requests)
exports.app = onRequest(async (req, res) => {
    //Call the setup function and await it before handling the request
    await setupApp()
    //Handle the request
    app(req, res)
})