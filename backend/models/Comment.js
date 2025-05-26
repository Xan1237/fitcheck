class Comment {
    constructor(id, user_id, username, gym_id, comment, rating, tags, created_at) {
        this.id = id;
        this.user_id = user_id;
        this.username = username;
        this.gym_id = gym_id;
        this.comment = comment;
        this.rating = rating;
        this.tags = tags;
        this.created_at = created_at;
    }
}

export default Comment;