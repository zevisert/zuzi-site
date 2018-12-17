export const ADMIN_CREATE_ITEM = 'ADMIN_CREATE_ITEM';
export const ADMIN_UPDATE_ITEM = 'ADMIN_UPDATE_ITEM';
export const ADMIN_DELETE_ITEM = 'ADMIN_DELETE_ITEM';

export const createItem = data => async dispatch => {

    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }

    const response = await fetch(`${process.env.API_URL}/artwork`, {
        method: "POST",
        body: formData
    });

    const reply = await response.json();
    const item = reply.post;
    console.log(item);

    dispatch({
        type: ADMIN_CREATE_ITEM,
        payload: {
            item
        }
    });
}

export const editItem = (slug, data) => async dispatch => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }

    const response = await fetch(`${process.env.API_URL}/artwork/${slug}`, {
        method: "PUT",
        body: formData
    });

    const reply = await response.json();
    const updated = reply.post;
    console.log(updated);

    dispatch({
        type: ADMIN_UPDATE_ITEM,
        payload: {
            updated
        }
    });
}


export const deleteItem = slug => async dispatch => {
    const response = await fetch(`${process.env.API_URL}/artwork/${slug}`, {
        method: "DELETE"
    });

    const updated = await response.json();
    console.log(updated);

    dispatch({
        type: ADMIN_DELETE_ITEM,
        payload: {
            slug
        }
    });
}