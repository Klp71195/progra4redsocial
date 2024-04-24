import sha256 from "crypto-js/sha256";
import { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { findUserByEmail } from "../../firebase/api";
import MyNavbar from "../navbar";
import './loginform.css';


export const LoginForm = () => {
    const [loginError, setLoginError] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.elements.formBasicEmail.value;
        const password = e.target.elements.formBasicPassword.value;
        try {
            const userData = await findUserByEmail(email);
            if (userData) {
                if (sha256(password).toString() === userData.password) {
                    console.log("Logged in successfully");
                    setLoginError(false);

                    localStorage.setItem('user', JSON.stringify(userData));
                    window.location.href = '/'; // Replace '/' with the actual home route
                } else {
                    console.log("Incorrect password");
                    setLoginError("Contraseña incorrecta. Por favor, inténtelo de nuevo.");
                }
            } else {
                console.log("No such user found");
                setLoginError("Usuario no encontrado.");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
    
    <div className="login-form-container">
        {loginError && (
            <Alert variant="danger">
                {loginError}
            </Alert>
        )}
    
    <div className="form-container mt-5">
        
        <Row className="justify-content-center">
            <Col md="6">
                <h2 className="text-center" style={{color: "navy"}}>Iniciar sesión</h2>
                <Form onSubmit={handleLoginSubmit}>
                    <Form.Group controlId="formBasicEmail" className="text-center" style={{color: 'navy'}}>
                        <Form.Label>Correo electrónico</Form.Label>
                        <Form.Control type="email" placeholder="Ingrese su correo electrónico" size="m" style={{ width: '300px' }}/>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="text-center" style={{color: 'navy'}}>
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" placeholder="Ingrese su contraseña" size="m" style={{ width: '300px' }}/>
                    </Form.Group>
                    <div className="mt-3 d-flex justify-content-center"> 
                    <Button variant="primary" type="submit" block>
                        Iniciar sesión
                    </Button>
                    </div>
                </Form>
                <p className="mt-3 text-center" style={{ color: 'navy'}}>
                    ¿No tienes una cuenta? 
                    <br>
                    </br><a href="register" style={{color: 'navy'}}>Crear una cuenta</a>
                </p>
            </Col>
        </Row>
    </div>
    </div>
    );
}