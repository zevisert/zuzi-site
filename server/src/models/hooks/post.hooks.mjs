/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import { Post } from '../post.model';
import { customEvents, ARTWORK_NEW }  from "../../events/registration";

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
