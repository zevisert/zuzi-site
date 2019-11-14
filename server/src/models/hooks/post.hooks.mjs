/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import { Post } from '../post.model';
import { customEvents, ARTWORK_NEW }  from "../../events/registration";

export async function pre_save() {
    const before = await Post.findById(this._id);
    const after = this;

    const conditions = Object.values({
        isNewPost: before === null,
        isNowPublishedPost: before !== null && before.active === false
    });

    const requirements = Object.values({
        isActive: after.active === true,
        isChanged: before !== null && before.active !== after.active
    });

    if (conditions.some(cond => cond) && requirements.every(req => req)) {
        customEvents.emit(ARTWORK_NEW, after._id);
    }
}
