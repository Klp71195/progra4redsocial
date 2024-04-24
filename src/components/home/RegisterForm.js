import React, { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import sha256 from "crypto-js/sha256";
import { saveUserData, findUserByEmail } from "../../firebase/api";
import MyNavbar from "../navbar";
import './RegisterForm.css';



export const RegisterForm = () => {
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registrationError, setRegistrationError] = useState(false);
    const [passwordsMatchError, setPasswordsMatchError] = useState(false);
    const [emailExistsError, setEmailExistsError] = useState(false);
    const [passwordStrengthError, setPasswordStrengthError] = useState(false);
    const [suggestedPassword, setSuggestedPassword] = useState("");

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.elements.formBasicName.value;
        const email = e.target.elements.formBasicEmail.value;
        const password = e.target.elements.formBasicPassword.value;
        const confirmPassword = e.target.elements.formBasicPasswordConfirmation.value;
        const description = e.target.elements.formBasicDescription.value; // Obtener la descripción personal
        const profilePicture = e.target.elements.formBasicProfilePicture.files[0];

        // Verificar si las contraseñas coinciden
        if (password !== confirmPassword) {
            setPasswordsMatchError(true);
            setTimeout(() => {
                setPasswordsMatchError(false);
            }, 5000);
            return;
        }

        // Verificar si el correo electrónico ya está registrado
        try {
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
                setEmailExistsError(true);
                setTimeout(() => {
                    setEmailExistsError(false);
                }, 5000);
                return;
            }
        } catch (error) {
            console.error('Error:', error);
            setRegistrationError(true);
            setTimeout(() => {
                setRegistrationError(false);
            }, 5000);
            return;
        }

        // Verificar la fortaleza de la contraseña
        if (!isStrongPassword(password)) {
            setPasswordStrengthError(true);
            setTimeout(() => {
                setPasswordStrengthError(false);
            }, 5000);
            return;
        }

        try {
            const userData = await saveUserData(
                username,
                email,
                sha256(password).toString(),
                profilePicture,
                description
            );

            if (userData) {
                console.log("User data saved successfully:", userData);
            } else {
                throw new Error("Error saving user data.");
            }

            setRegistrationSuccess(true);
            setRegistrationError(false);
            setTimeout(() => {
                setRegistrationSuccess(false);
            }, 5000);
            window.location.href = "/";
        } catch (error) {
            setRegistrationSuccess(false);
            setRegistrationError(true);
            console.error("Error al guardar los datos en Firebase Firestore:", error);
            setTimeout(() => {
                setRegistrationError(false);
            }, 5000);
        }
    };

    const isStrongPassword = (password) => {
        // Verificar si la contraseña contiene al menos dos letras, al menos dos números y al menos un carácter especial
        const letterCount = password.replace(/[^a-zA-Z]/g, "").length;
        const numberCount = password.replace(/[^0-9]/g, "").length;
        const specialCharCount = password.replace(/[a-zA-Z0-9]/g, "").length;
        
        return letterCount >= 2 && numberCount >= 2 && specialCharCount >= 1;
    };

    const suggestPassword = () => {
        const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const specials = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        let suggestedPassword = "";
        let suggestedLetters = "";
        let suggestedNumbers = "";
        let suggestedSpecials = "";

        // Generar sugerencias de letras, números y caracteres especiales
        for (let i = 0; i < 2; i++) {
            suggestedLetters += letters[Math.floor(Math.random() * letters.length)];
            suggestedNumbers += numbers[Math.floor(Math.random() * numbers.length)];
            suggestedSpecials += specials[Math.floor(Math.random() * specials.length)];
        }

        // Combinar sugerencias aleatorias
        suggestedPassword = suggestedLetters + suggestedNumbers + suggestedSpecials;

        // Barajar la sugerencia
        suggestedPassword = suggestedPassword.split('').sort(() => Math.random() - 0.5).join('');

        setSuggestedPassword(suggestedPassword);
    };

    return (
        <>
            <MyNavbar />
            {registrationSuccess && (
                <Alert variant="success">
                    La cuenta se ha creado correctamente, intente iniciar sesión!
                </Alert>
            )}
            {registrationError && (
                <Alert variant="danger">
                    La cuenta no se pudo crear, intente nuevamente!
                </Alert>
            )}
            {passwordsMatchError && (
                <Alert variant="warning">
                    Las contraseñas no coinciden, intenta nuevamente!
                </Alert>
            )}
            {emailExistsError && (
                <Alert variant="danger">
                    El correo electrónico ya ha sido registrado anteriormente.
                </Alert>
            )}
            {passwordStrengthError && (
                <Alert variant="warning">
                    La contraseña debe tener al menos dos letras, al menos dos números y al menos un carácter especial.
                </Alert>
            )}
            <Row className="mt-3 justify-content-md-center">
                <Col md="6">
                    <h2>Crear una cuenta</h2>
                    <Form onSubmit={handleRegistrationSubmit}>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Nombre de usuario</Form.Label>
                            <Form.Control type="text" placeholder="Ingrese su nombre de usuario" />
                        </Form.Group>

                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Correo electrónico</Form.Label>
                            <Form.Control type="email" placeholder="Ingrese su correo electrónico" />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Ingrese su contraseña"
                                onChange={() => suggestPassword()}
                            />
                            {suggestedPassword && (
                                <Form.Text className="text-muted">
                                    Sugerencia de contraseña: <strong>{suggestedPassword}</strong>
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group controlId="formBasicPasswordConfirmation">
                            <Form.Label>Repetir contraseña</Form.Label>
                            <Form.Control type="password" placeholder="Repita su contraseña" />
                        </Form.Group>

                        <Form.Group controlId="formBasicProfilePicture">
                            <Form.Label>Foto de perfil</Form.Label>
                            <Form.Control type="file" accept="image/*" />
                            <Form.Text className="text-muted">
                                Seleccione una imagen para su foto de perfil.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formBasicDescription">
                            <Form.Label>Descripción Personal</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Ingrese una descripción personal..."
                            />
                        </Form.Group>

                        <br></br>
                        <Button variant="primary" type="submit">
                            Registrarse
                        </Button>
                    </Form>
                    <p className="mt-3 text-center">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login">
                            Iniciar sesión
                        </Link>
                    </p>
                </Col>
            </Row>
        </>
    );
};
