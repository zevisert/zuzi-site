/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import {
    customEvents,
    ARTWORK_NEW
}  from "./registration"

import { User } from '../user.model';
import { Subscription } from '../subscription.model';
import { email } from '../../email';

import { notifySubscribersPosting } from '../../email/templates/subscriptions'

customEvents.on(ARTWORK_NEW, post => {

    // Do this asynchronously
    setImmediate(() => {
        // Send emails
        const users = await User.find({ subscriber: true });
        for (const user of users) {
            email.deliver(notifySubscribersPosting(post, user))
            .catch(error => {
                console.log(`Email to ${user.email} failed to deliver`)
                console.warn(error)
            });
        }

        // Send push notifications
        const subscriptions = await Subscription.find({})
        for (const subscription of subscriptions) {

            webpush.sendNotification(subscription, JSON.stringify({
                title: "New artwork!",
                body: "A new art piece was just posted to Zuzana Riha's gallery",
                url: `${process.env.SITE_URL}/gallery/${post.slug}`,
                image: `${process.env.SITE_URL}/uploads/${post.preview}`
            }))
            .catch(() => {
                // Remove the subscription if it failed
                console.log(`Subscription ${subscription._id} failed to send, deleting`);
                subscription.delete();
            });
        }
    })
})