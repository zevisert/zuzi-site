/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import webpush from 'web-push'

import {
    customEvents,
    ARTWORK_NEW
}  from './registration.js'

import { User } from './../models/user.model.js';
import { Post } from './../models/post.model.js';
import { Subscription } from '../models/subscription.model.js';
import { email, withContext } from '../email/index.js';

import { notifySubscribersPosting } from '../email/renderers/subscriptions.js'

webpush.setVapidDetails(
    `mailto:${process.env.SUPPORT_EMAIL}`,
    process.env.PUSH_PUBKEY,
    process.env.PUSH_SECRET
);

customEvents.on(ARTWORK_NEW, async post_id => {

    const post = await Post.findById(post_id);

    // Do this asynchronously
    setImmediate(async () => {

        // Send emails
        const users = await User.find({ subscriber: true });
        for (const user of users) {
            email.deliver(notifySubscribersPosting(withContext({
                headline: "Activity update",
                delivery_reason: [
                    "This message was automatically generated in response to activity within the gallery.",
                    "A new piece of artwork has been published.",
                    "You are a recipient of this message because your email address is registered for activity updates."
                ].join(" ")
            }, undefined, post, user)))
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
