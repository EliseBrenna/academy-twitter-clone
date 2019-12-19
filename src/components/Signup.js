import React from 'react';
import { createUser } from '../services/users';

class Signup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            signupForm: {
                name: '',
                handle: '',
                password: ''
            },
            error: null,
            isSigningUp: false
        }
    }

    handleInputChange(field, event) {
        this.setState({
            signupForm: {
                ...this.state.signupForm,
                [field]: event.target.value
            }
        });
    }

    async handleSignupAttempt(event) {
        event.preventDefault();
        const { history } = this.props;
        const { name, handle, password } = this.state.signupForm;

        try {
            this.setState({ isSigningUp: true, error: null });
            const { token, error } = await createUser({ name, handle, password });

            if (error) {
                throw new Error(error);
            }

            if(!token) {
                throw new Error('No token received - try again');
            }

            localStorage.setItem('twitter_clone_token', token);
            history.push('/home');
        } catch (error) {
            this.setState({ error, isSigningUp: false });
        }
    }


    render() {
        const { error, isSigningUp } = this.state;

        return (
            <div className="signup-page">
            <div className="signup-form">
                <form>
                    <div>
                        <label>
                            Name
                            <input 
                            type="text"
                            value={this.state.signupForm.name}
                            onChange={this.handleInputChange.bind(this, 'name')} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Username
                            <input type="text"
                            value={this.state.signupForm.handle}
                            onChange={this.handleInputChange.bind(this, 'handle')} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Password
                            <input 
                                type="password"
                                value={this.state.signupForm.password}
                                onChange={this.handleInputChange.bind(this, 'password')} />
                        </label>
                    </div>
                    <div>
                        <button onClick={this.handleSignupAttempt.bind(this)}>SIGN UP</button>
                    </div>
                    <div>
                        {isSigningUp && <p>Signing up...</p>}
                        {error && <p>Unable to sign up: {error.message}</p>}
                    </div>
                </form>
            </div>
        </div>
        );
    }
}

export default Signup;