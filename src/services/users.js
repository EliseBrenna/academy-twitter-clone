const API_URL = '/api';

export function createUser({ name, handle, password }) {
    return fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, handle, password }),
    })
    .then((res) => res.json());
}