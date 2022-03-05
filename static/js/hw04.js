const getCookie = key => {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

const toggleFollow = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.userId);
    console.log(elem.innerHTML);

    if (elem.innerHTML === 'follow'){
        followUser(elem.dataset.userId, elem);
    }
    else {
        unfollowUser(elem.dataset.followingId, elem);
    }
};

const followUser = (userId, elem) => {
    const postData = {
        "user_id": userId
    };
    
    fetch("/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'unfollow';
            elem.setAttribute('aria-checked', 'true');
            elem.classList.add('unfollow');
            elem.classList.remove('follow');
            elem.setAttribute('data-following-id', data.id);
        });
};

const unfollowUser = (followingId, elem) => {
    const deleteURL = `/api/following/${followingId}`;
    fetch(deleteURL, {
        method: "DELETE",
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = 'follow';
        elem.classList.add('follow');
        elem.classList.remove('unfollow');
        elem.removeAttribute('data-following-id');
        elem.setAttribute('aria-checked', 'false');
    });
}

const story2Html = story => {
    return `
            <person>
                <img src="${story.user.thumb_url}" alt="story from ${story.user.username}">
                <p> ${story.user.username} </p>
            </person>
    `;
};

const suggestions2Html = user => {
    return `<suggestion>
                <img src="${user.thumb_url}" alt="profile photo for ${user.username}">
                <middle-section>
                    <p> ${user.username} </p>
                    <p class="suggestions"> Suggested for you </p>
                </middle-section>
                <button class="follow" aria-label="Follow" aria-checked="false" data-user-id="${user.id}" onclick="toggleFollow(event);">follow</button>
            </suggestion>`
};

const toggleLike = ev => {
    const elem = ev.currentTarget;
    console.log(elem.dataset.likeId);
    console.log(elem.dataset.postId);

    if (elem.dataset.likeId === "") {
        likePost(elem.dataset.postId, elem);
    }
    else{
        unlikePost(elem.dataset.postId, elem.dataset.likeId, elem);
    }

};

const likePost = (post_id, elem) => {
    const postData = {
        "post_id": post_id
    };
    
    fetch(`/api/posts/${post_id}/likes/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            response.json()
            if (response.status === 201) {
                displayPosts();
            }
        })
        .then(data => {
            console.log(data);
            elem.innerHTML = `<i class="fas fa-heart"></i>`;
            elem.setAttribute('aria-checked', 'true');
            elem.setAttribute(`data-like-id`, data.id);
            // elem.setAttribute('onclick', `unlikePost(${post_id}, ${post}, ${ev});`);
        });
};

const unlikePost = (post_id, like_id, elem) => {

    const deleteURL = `/api/posts/${post_id}/likes/${like_id}`;
    fetch(deleteURL, {
        method: "DELETE",
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => {
        response.json()
        if (response.status === 200) {
            displayPosts();
        }
    })
    .then(data => {
        console.log(data);
        elem.innerHTML = `<i class="far fa-heart"></i>`;
        elem.setAttribute('aria-checked', 'false');
        elem.setAttribute(`data-like-id`, "");
        // elem.setAttribute('onclick', `likePost(${post_id}, ${post}, ${ev});`);
    });
};

const toggleBookmark = ev => {
    const elem = ev.currentTarget;
    console.log(elem.dataset.bookmarkId);
    console.log(elem.dataset.postId);

    if (elem.dataset.bookmarkId === "") {
        bookmarkPost(elem.dataset.postId, elem);
    }
    else{
        unbookmarkPost(elem.dataset.bookmarkId, elem);
    }
};

const bookmarkPost = (post_id, elem) => {
    const postData = {
        "post_id": post_id
    };
    
    fetch(`/api/bookmarks/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = `<i class="fas fa-bookmark"></i>`;
            elem.setAttribute('aria-checked', 'true');
            elem.setAttribute('data-bookmark-id', data.id);
            // elem.setAttribute('onclick', `unlikePost(${post_id}, ${post}, ${ev});`);
        });
};

const unbookmarkPost = (bookmark_id , elem) => {
    const deleteURL = `/api/bookmarks/${bookmark_id}`;
    fetch(deleteURL, {
        method: "DELETE",
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = `<i class="far fa-bookmark"></i>`;
        elem.setAttribute('aria-checked', 'false');
        elem.setAttribute('data-bookmark-id', "");
        // elem.setAttribute('onclick', `likePost(${post_id}, ${post}, ${ev});`);
    });
};

const destroyModal = (postID, ev) => {
    document.querySelector('#modal-container').innerHTML = "";
    document.getElementById(`viewAll${postID}`).focus();
};

const showPostDetail = (postID, ev) =>{

    document.addEventListener('keyup', (event) =>
    {
        if (event.key === 'Escape') {
            destroyModal(postID, event);
        }
    }, false);

    console.log(postID);
    fetch(`/api/posts/${postID}`)
        .then(response => response.json())
        .then(post => {
            const html =`<div class="modal-bg">
                            <button id="close" onclick="destroyModal(${postID}, event)" >Close</button>
                            <div class="modal">
                                <img src="${post.image_url}" />
                                <commentbox>
                                    <commentprofile>
                                        <img class="commenter" src="${post.user.thumb_url}" />
                                        <p>${post.user.username}</p>
                                    </commentprofile>
                                    <commentlist>
                                        ${displayAllComments(post, post.comments)}
                                    </commentlist>
                                </commentboc>
                            </div>
                        </div>`;
            
            document.querySelector('#modal-container').innerHTML = html;
            document.getElementById('close').focus();
        });   
};

const displayComments = (comments, post, postID) => {
    let html = '';
    if (comments.length > 1) {
        html += `<div>
        <button class='num_comments' data-post-id="${postID}" id="viewAll${postID}" onclick="showPostDetail(${postID}, event);"> View all ${ comments.length } comments. </button>
        </div>`;
    }
    if (comments && comments.length > 0) {
        const lastComment = comments[comments.length - 1];
        html += `<p class='comment' id="comment_user"> <strong> ${ lastComment.user.username } </strong> ${ lastComment.text } </p>`
    }
    html += `<p class='time'>${post.display_time}</p>`
    html += `<commentbar>
                <i class="far fa-smile"></i>
                    <input id="comment-${postID}" type="text" aria-label="Add a comment" placeholder="Add a comment..."</input>
                    <button class='post-button' onclick="addComment(${postID}, document.getElementById('comment-${postID}').value, event);"><p> Post </p></button>
            </commentbar>`

    return html;
}

const displayAllComments = (post, comments) => {
    let html = '';

    html += html += `
            <div class='topcomment'>
                <img src="${post.user.thumb_url}"/>
                <p class='modal-comment'> <strong> ${ post.user.username } </strong> ${ post.caption } <br> <strong> ${post.display_time} </strong> </br> </p>
                <button><i class="far fa-heart"></i></button>
            </div>`;

    for (let i=0; i<comments.length; i++) {
        html += `
        <div class='onecomment'>
            <img src="${comments[i].user.thumb_url}"/>
            <p class='modal-comment'> <strong> ${ comments[i].user.username } </strong> ${ comments[i].text } <br> <strong> ${comments[i].display_time} </strong> </br> </p>
            <button><i class="far fa-heart"></i></button>
        </div>`
    
    }

    return html;
}

const addComment = (postId, input, ev) => {
    console.log(input);
    console.log(ev);

    const postData = {
        "post_id": postId,
        "text": input
    };
    
    fetch("/api/comments/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            response.json()
            if (response.status === 201) {
                displayPosts();
            }
        })
        .then(data => {
            console.log(data);
        });
}

const post2Html = post => {
    return `
        <photos>
            <photo>
                <topofphoto>
                    <h3 id="user"> ${ post.user.username } </h3>
                    <h3 id="dots"> ... </h3>
                </topofphoto> 
                <img src="${ post.image_url }" alt= "photo from ${ post.user.username }">
                <iconbar>
                    <button id="likeButton4${post.id}" data-post-id="${post.id}" data-like-id="${post.current_user_like_id || ""}" aria-label="Like"
                     aria-checked=${post.current_user_like_id ? 'true' : 'false'}
                    onclick="toggleLike(event);">
                        <i class="fa${post.current_user_like_id ? 's' : 'r'} fa-heart"></i>
                    </button>
                    <i class="far fa-comment"></i>
                    <i class="far fa-paper-plane"></i>
                    <button class='bookmark' aria-label="Bookmark" data-post-id="${post.id}" data-bookmark-id="${post.current_user_bookmark_id || ""}" aria-checked=${post.current_user_bookmark_id ? 'true' : 'false'}
                    onclick="toggleBookmark(event);">
                        <i class="fa${post.current_user_bookmark_id ? 's' : 'r'} fa-bookmark"></i>
                    </button>
                </iconbar>
                <p class='likes'> ${ post.likes.length } like${post.likes.length != 1 ? 's' : ''} </p>
                <p class="title"> <strong> ${post.user.username} </strong> ${post.caption}
                ${displayComments(post.comments, post, post.id)}
            </photo>
        </photos>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = (stories.map(story2Html)).slice(0,6).join('\n');
            document.querySelector('.stories').innerHTML = `<div style="margin-top: 100px;">` + html + `</div>`;
        })
};

const displayProfile = () => {
    fetch('/api/profile')
        .then(response => response.json())
        .then(user => {
            const html = `
                <img src="${user.image_url}" alt="profile photo for ${user.username}">
                <p style="margin-left: 15px;"><strong>${user.username}</strong></p>
            `;
            document.querySelector('.profile').innerHTML = html;
        })
};

const displaySuggestions = () =>{
    fetch('/api/suggestions')
        .then(response => response.json())
        .then(users => {
            const html = users.map(suggestions2Html).join('\n');
            document.querySelector('.suggestions').innerHTML = html;
        })
}


const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};

const initPage = () => {
    displayProfile();
    displaySuggestions();
    displayStories();
    displayPosts();
};

// invoke init page to display stories:
initPage();