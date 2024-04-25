import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Ban, Bell, Envelope, PersonFill, PersonFillAdd, Search } from 'react-bootstrap-icons'; // Importa los nuevos iconos
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import { db } from '../firebase/config';
import './Navbar_log.css';
import { BellFill } from 'react-bootstrap-icons';




const dropdownTitleStyle = {
  color: 'white',
};

const iconStyle = {
  cursor: 'pointer',
  transition: 'color 0.3s ease',
};

function Navbar_log(props) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);



  const fetchFriendRequests = async () => {
    try {
      const q = query(collection(db, 'friendRequests'),
        where('reciever', '==', props.username),
        where('stat', '==', 0));
      const querySnapshot = await getDocs(q);
      const requestsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setFriendRequests(requestsList);

      setNotificationCount(requestsList.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [props.username]);


  const openSearchDialog = () => {
    setSearchDialogOpen(true);
  };

  const closeSearchDialog = () => {
    setSearchDialogOpen(false);
  };

  const handleLogout = () => {
    window.location.href = '/';
    window.localStorage.removeItem('user');
  };
  const handleAcceptRequest = async (request) => {
    try {
      if (!request.id) {
        console.error('ID de solicitud indefinido');
        return;
      }

      const requestRef = doc(db, 'friendRequests', request.id);
      await updateDoc(requestRef, { stat: 1 });

      await addDoc(collection(db, 'notifications'), {
        type: 'friend_request',
        sender: request.sender,
        receiver: props.username,
        timestamp: new Date()
      });

      fetchFriendRequests();
    } catch (error) {
      console.error('Error al aceptar solicitud de amistad:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
      fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };




  return (
    <Navbar expand="lg" navbar-light="true">
      <Container>
        <Navbar.Brand href="/" style={{color: 'navy'}}>PHOTOBOOKCODE</Navbar.Brand>

        <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-between"
        title={
          <div>
            <BellFill size={20} style={{ ...iconStyle, marginRight: '15px', color:'navy' }} /> { }
            {notificationCount > 0 && <Badge bg="danger">{notificationCount}</Badge>}
          </div>
        }
        id="notification-nav-dropdown"
        style={{ ...dropdownTitleStyle, maxWidth: '300px', minWidth: '200px', whiteSpace: 'normal' }}>
        {/* Condición para mostrar el icono o el texto */}
        {friendRequests.length === 0 ? (
          // Muestra un ícono si no hay notificaciones pendientes
          <NavDropdown.Item>
            <BellFill size={20} style={{ marginRight: '5px', color: 'navy' }} />
          </NavDropdown.Item>
        ) : (
          // Muestra las solicitudes de amistad si las hay
          friendRequests.map((request, index) => (
            <NavDropdown.Item key={index}>
              <Card>
                <Card.Body>
                  {request.sender} te ha enviado una solicitud de conexión
                </Card.Body>
                <Card.Footer>
                  <Button variant="success" onClick={() => handleAcceptRequest(request)}>
                    <PersonFillAdd color="navy" size={20} />
                  </Button>
                  <Button variant="danger" onClick={() => handleRejectRequest(request.id)}>
                    <Ban color="navy" size={20} />
                  </Button>
                </Card.Footer>
              </Card>
            </NavDropdown.Item>
          ))
        )}
      </Navbar.Collapse>

        {/* Icono de búsqueda con funcionalidad */}
        <Search className="icon" color="navy" size={20} style={{ marginRight: '150px', cursor: 'pointer', color: '#000' }} onClick={openSearchDialog} />
        <Envelope className="icon" color="navy" size={20} style={{ marginRight: '150px', cursor: 'pointer', color: '#000' }} />
        <PersonFill className="icon" color="navy" size={20} style={{ marginRight: '150px', cursor: 'pointer', color: '#000'}} onClick={() => window.location.href = `/profile/${props.username}`} />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '10px' }}></div>
            <NavDropdown title={props.username} id="user-nav-dropdown" style={dropdownTitleStyle}>
              <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
            </NavDropdown>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>


      {/* Diálogo de búsqueda */}
      <Modal show={searchDialogOpen} onHide={closeSearchDialog}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicSearch">
              <Form.Label>Buscar:</Form.Label>
              <Form.Control type="text" placeholder="Ingresa tu búsqueda" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeSearchDialog}>
            Cerrar
          </Button>
          <Button variant="primary">
            Buscar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Formulario en blanco */}
      {props.showBlankForm && (
        <Row className="mt-3 justify-content-md-center">
          <Col md="6">
            <h2>Formulario en blanco</h2>
            <Form>
              <Button variant="primary" type="submit">
                Enviar
              </Button>
            </Form>
          </Col>
        </Row>
      )}
    </Navbar>
  );

}

export default Navbar_log;
