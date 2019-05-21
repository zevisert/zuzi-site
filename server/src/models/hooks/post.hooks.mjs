/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import webpush from 'web-push';
import { Post } from '../post.model';
import { customEvents, ARTWORK_NEW }  from "../../events/registration";

webpush.setVapidDetails(
    `mailto:${process.env.SUPPORT_EMAIL}`,
    process.env.PUSH_PUBKEY,
    process.env.PUSH_SECRET
);

export async function pre_save() {
    const existing = await Post.findById(this._id);

    const conditions = Object.values({
        newPost: existing === null,
        publishedPost: existing !== null && existing.active === false && this.active === true
    });

    const requirements = Object.values({
        isActive: this.active === true
    });

    if (conditions.some(cond => cond === true) && requirements.every(req => req === true)) {
        customEvents.emit(ARTWORK_NEW, this);
    }
}
