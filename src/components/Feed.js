import React from 'react';
import jwtDecode from 'jwt-decode';
import { Link } from 'react-router-dom';
import { getTweets, postTweet } from '../services/tweets';

class Feed extends React.Component {
    constructor(props) {
        super(props);

        const token = localStorage.getItem('twitter_clone_token');
        const payload = jwtDecode(token);

        this.state = {
            tweets: [],
            isLoading: false,
            error: null,
            message: '',
            session: payload,
        }
    }

    async componentDidMount() {
        await this.populateTweets();

    }


    async populateTweets() {
        try {
            this.setState({ isLoading: true });
            const tweets = await getTweets();
            this.setState({ tweets, isLoading: false });
        } catch (error) {
            this.setState({ error });
        }
    }


    handleInputChange(field, event) {
        this.setState({
            [field]: event.target.value
        });
    }
    
    async handleSubmitTweet() {
        const { message } = this.state;

        if (!message) {
            return;
        }

        const newTweet = await postTweet(message);
        await this.populateTweets();
    }

    render() {
        const { 
            session: {
                name,
                handle,
            } = {},
            tweets,
            isLoading,
            error,
            message
         } = this.state;

         if (error) {
             return (
                 <div>Unable to fetch tweets: {error.message}</div>
             );
         }

         if (isLoading) {
             return (
                 <div>Loading tweets..</div>
             );
         }

         const tweetElements = tweets.map(({ id, message, name, handle, created_at }) => {
             const styles = {
                border: '1px solid black', 
                padding: 10, 
                margin: 10
             }

             return (
                 <div className="tweet-message" key={id} style={styles}>
                     <p className="tweet-name">{name} (@{handle})</p>
                     <p>{message}</p>
                 </div>
             )
         });

        return (
            <div className="feed">
                <h1>Feed for {name} (@{handle})</h1>
                
                <div className="tweet-box">
                    <textarea placeholder="What's on your mind?" value={message} onChange={this.handleInputChange.bind(this, 'message')}></textarea>
                    <button onClick={this.handleSubmitTweet.bind(this)}>Tweet</button>
                </div>
                <div>
                    
                </div>
                <div className="tweet-elements">{tweetElements}</div>
                <Link to="/logout">Log out</Link>
            </div>
        );
    }
}

export default Feed;