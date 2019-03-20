# Node-API
This project uses express and mongodb as backend and passport jwt as user authentication.
## API endpoints
1. `/` GET request, or root which tells the status of server.
2. `/users` which includes all authentication/registeration routes.
  * `/` GET request, returns array of all users.
  * `/:uid` GET request, returns a user with corresponding id.
  * `/:uid` PATCH request, form data (name, password, cover, profile, google, facebook, twitter, addFriend, friendID, deleteFriend).
  * `/:uid` DELETE request, Deletes user with corresponding id.
  * `/register` POST request, required form data is (name, email, username, password) and (profile, cover) are optional (image) fields.
  * `/login` POST request, required form data (email/username , password).
  * `/check/uname/:uname` GET request, tells whether the username is available or not.
  * `/verification/:uid/:vtoken` GET request, verifies the current registered user.
3. `/posts` which includes post related routes.
  * `/` GET request, returns array of posts.
  * `/:pid` GET request, returns a post with corresponding id.
  * `/:pid` PATCH request, form data (content, likerID, commenterID, commentMsg, commentID, deleteComment, sharePost, sharerID, unshare)
  * `/:pid` DELETE request, deletes post with corresponding id.
  * `/add` POST request, form data (content, userId)
