import React from 'react';
import { createSession } from '../services/session';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginForm: {
                handle: '',
                password: '',
            },
            error: null,
            isLoggingIn: false
        }
    }

    handleInputChange(field, event) {
        this.setState({
            loginForm: {
                ...this.state.loginForm,
                [field]: event.target.value
            }
        });
    }


    async handleLoginAttempt(event) {
        event.preventDefault();
        const { history } = this.props;
        const { handle, password } = this.state.loginForm;
        
        try {
            this.setState({ isLoggingIn: true, error: null });
            const { token, error } = await createSession({ handle, password });

            if (error) {
                throw new Error(error);
            }

            if(!token) {
                throw new Error('No token received - try again');
            }

            localStorage.setItem('twitter_clone_token', token);
            history.push('/home');
        } catch (error) {
            this.setState({ error, isLoggingIn: false });
        }
    } 

    async handleSignupAttempt() {
        const { history } = this.props;
        history.push(`/signup`);
    }


    render() {
        const { error, isLoggingIn } = this.state;

        return (
            <div className="front-page">
                <div className="login-form">
                    <h1>Log in</h1>

                    <form>
                        <div>
                            <label>
                                Username
                                <input 
                                    type="text" 
                                    value={this.state.loginForm.handle}
                                    onChange={this.handleInputChange.bind(this, 'handle')}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Password
                                <input 
                                    type="password" 
                                    value={this.state.loginForm.password}
                                    onChange={this.handleInputChange.bind(this, 'password')}
                                />
                            </label>
                        </div>
                        <div>
                            <button onClick={this.handleLoginAttempt.bind(this)}>SUBMIT</button>
                        </div>
                        <div>
                            {isLoggingIn && <p>Logging in...</p>}
                            {error && <p>Unable to log in: {error.message}</p>}
                        </div>
                    </form>
                <div/>
            </div>

            <div className="signup">
                <div>
                    <h1>.. or sign up</h1>
                    <button onClick={this.handleSignupAttempt.bind(this)}>SIGN UP</button>
                </div>
            </div>  
        </div>
        );
    }
}

export default Login;