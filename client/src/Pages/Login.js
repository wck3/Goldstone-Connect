import React from 'react';
import { useRef, useState, useEffect, useFocus } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./Login.css";
import axios from 'axios';
import logo from '../Media/Gold_slogan.png';
import video from '../Media/video.mp4'



// User Regex for validation
const PWD_REGEX = /^(?=.*[a-z])(.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.+[a-zA-Z]{3,23}$/;
const api_url = process.env.REACT_APP_API_URL;
const LOGIN_URL = api_url + 'users/login';

function Login (){

    const navigate = useNavigate();
    const errRef = useRef();
    const emailRef = useRef();
    
    // form states
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState(false);
    
    // clear form when an error occurs
    useEffect(() => {
        setErrMsg('');
    }, [email, pwd]);

    useEffect(() => {
        var video = document.getElementById('video-background');
        video.play();
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // prevent js hacking
        const v1 = EMAIL_REGEX.test(email);
        const v2 = PWD_REGEX.test(pwd);
        if(!v1 || !v2){  
            setEmail('');
            setPwd('');
            setTimeout(() => {
                setErrMsg("INVALID CREDENTIALS");
            }, 0)
            emailRef.current.focus();
            return;
        }
        try{
            const response =  await axios.post(LOGIN_URL, 
                JSON.stringify({email, pwd}),{
                    headers : {'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            // user validated, send to homepage
            if(response.data.length > 0){
                navigate("/");
            }
        } catch (err){ 
            setEmail('');
            setPwd('');
            if(!err.response){
                setTimeout(() => {
                    setErrMsg('No Server Response');
                }, 0)
            }
            else if(err.response?.status === 409){
                setTimeout(() => {
                    setErrMsg('INVALID CREDENTIALS');
                }, 0)
            }
            else{
                setTimeout(() => {
                    setErrMsg('LOGIN FAILED');
                }, 0)
            }  
            emailRef.current.focus();
            errRef.current.focus();
        }
        
        return;
    }

    return (
        <div className="Login">
            <div className='login-form'>
                <h1>Welcome</h1>
                <h2>PLEASE LOGIN</h2>
                <form onSubmit={handleSubmit}>    
                    <input 
                        required
                        type="email"
                        id="email" 
                        autoComplete="off" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                        ref={emailRef}
                        placeholder='EMAIL'
                    />
                    <input 
                        required 
                        type="password" 
                        id="pwd"  
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        placeholder='PASSWORD'
                    />
                    <h3 ref={errRef} className={"errmsg" + errMsg ? styles.errmsg : "hide"}>{errMsg}</h3>
                    <button>SIGN IN</button>
                </form>
            </div>
            
            <div className='login-graphic' >
                <div className="background"  style={{backgroundImage: 'url(' + require('../Media/video.mp4') + ')'}}>
                <video id="video-background" autoPlay muted loop>
                    <source src={video} type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
                 </div>
                <img  loading="lazy" className="logo" src={logo} alt="Goldstone Hub" />
            </div>
        </div>
    );
}

export default Login;
