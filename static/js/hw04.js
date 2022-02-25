const story2Html = story => {
    return `
        <person>
            <img src="${ story.user.thumb_url }" alt="profile pic for ${ story.user.username }">
            <p> ${ story.user.username } </p>
        </person>
    `;
};

const likeUnlike = ev => {
    console.log('like / unlike button clicked');
};

const displayComments = comments => {
    let html = '';
    if (comments.length > 1) {
        html += `<button class='num_comments'> View all ${ comments.length } comments. </button>`;
    }
    if (comments && comments.length > 0) {
        const lastComment = comments[comments.length - 1];
        html += `<p class='comment' id="comment_user"> <strong> ${ lastComment.user.username } </strong> ${ lastComment.text } </p>`
    }
    return html;
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
                <button>
                    <i class="fa${post.current_user_like_id ? 's' : 'r'} fa-heart"></i>
                </button onclick="likeUnlike(event)">
                <i class="far fa-comment"></i>
                <i class="far fa-paper-plane"></i>
                <i class="fa${post.current_user_bookmark_id ? 's' : 'r'} fa-bookmark"></i>
                <p class='likes'> ${ post.likes.length } like${post.likes.length != 1 ? 's' : ''} </p>
                <p class="title"> <strong> ${post.user.username} </strong> ${post.caption}
                ${displayComments(post.comments)}
                <p class="time"> ${post.pub_date} </p>
                <commentbar>
                    <i class="far fa-smile"> Add a comment...</i>
                    <p> Post </p>
                </commentbar>
            </photo>
        </photos>
    `;
};
// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = `<stories>` + html + `</stories>`;
        })
};


const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};

const initPage = () => {
    displayStories();
    displayPosts();
};

// invoke init page to display stories:
initPage();