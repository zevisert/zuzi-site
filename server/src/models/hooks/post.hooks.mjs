import { User } from '../user.model';
import { Post } from '../post.model';
import { email } from '../../email';

import { notifySubscribersPosting } from '../../email/templates/subscriptions'

export async function pre_save() {
    const existing = await Post.findById(this._id);
    const conditions = {
        newPost: existing === null,
        publishedPost: existing !== null && existing.active === false && this.active === true
    }

    const requirements = {
        isActive: this.active === true
    }

    if ( Object.values(conditions).some(cond => cond === true) && Object.values(requirements).every(req => req === true)) {
        const users = await User.find({ subscriber: true });
        console.log({ this: this, existing, users });

        for (const user of users) {
            email.deliver(notifySubscribersPosting(this, user)).catch(error => {
                console.log(`Email to ${user.email} failed to deliver`)
                console.warn(error)
            })
        }
    }
}
