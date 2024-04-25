import { addDoc, and, collection, deleteDoc, doc, onSnapshot, or, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Ban, PersonFillAdd } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import _ from 'lodash';
import { sendFriendRequest } from '../firebase/api';
import { db } from '../firebase/config';
import './friendsoffcanvas.css';

function FriendsOffcanvas(props) {
  const [key, setKey] = useState('friendships');
  const [friends, setFriends] = useState([]);
  const [peopleToDiscover, setPeopleToDiscover] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [allPeople, setAllPeople] = useState([]);

  const handleAcceptRequest = async (request) => {
    try {
          if (!request.id) {
            console.error('ID de solicitud indefinido');
            return;
          }

          const requestRef = doc(db, 'friendRequests', request.id);
          await updateDoc(requestRef, { status: 'accepted' });

          await addDoc(collection(db, 'notifications'), {
            type: 'friend_request',
            sender: request.sender,
            receiver: props.username,
            timestamp: new Date()
          });

          fetchFriendRequests();
          fetchFriends();
          setPeopleToDiscover(peopleToDiscover.filter(person =>
            person.username !== props.username ));
      } catch (error) {
        console.error('Error al aceptar solicitud de amistad:', error);
      }
  };

  const handleRejectRequest = async (request) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', request.id));
      fetchFriendRequests();
      setPeopleToDiscover(peopleToDiscover.map(person =>
        person.username === request.receiver ? { ...person, requestSent: false } : person
      ))
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // Función para enviar o rechazar una solicitud de amistad
  const handleFriendRequest = async (receiver, reject = false) => {
    const sender = props.username;
    const status = reject ? 2 : 0; // 2 para rechazado

    try {
      // Verificar si ya existe una solicitud con los mismos remitente y receptor
      const existingRequestAndFriends = [...friends, ...friendRequests];

      const existingRequest = existingRequestAndFriends.find(request =>
        request.sender === sender && request.receiver === receiver
      )

      if (existingRequest) {
        return;
      }

      if (!reject) {
        const sent = await sendFriendRequest(receiver, sender, status);
        if (sent) {
          // Marcar la solicitud como enviada
          const updatedPeopleToDiscover = peopleToDiscover.map(person =>
            person.username === receiver ? { ...person, requestSent: true } : person
          );
          setPeopleToDiscover(updatedPeopleToDiscover);
          // Agregar la solicitud a la lista de solicitudes del usuario
          fetchFriendRequests();
        } else {
          console.log("Error al enviar la solicitud");
        }
      } else {
        console.log("Solicitud rechazada");
        // Eliminar la persona de la lista
        const updatedPeopleToDiscover = peopleToDiscover.filter(person =>
          person.username !== receiver
        );
        setPeopleToDiscover(updatedPeopleToDiscover);
      }
    } catch (error) {
      console.error('Error sending/rejecting friend request:', error);
    }
  };

  // Función para obtener la lista de amigos del usuario
  const fetchFriends = () => {
    setFriends([]);
    
    const currentUser = props.username;
    const q1 = query(collection(db, 'friendRequests'),
      where('status', '==', 'accepted'), // Cambiar a 'accepted'
      where('receiver', '==', currentUser));

    const q2 = query(collection(db, 'friendRequests'),
      where('status', '==', 'accepted'), // Cambiar a 'accepted'
      where('sender', '==', currentUser));

    const unsubscribe1 = onSnapshot(q1, (querySnapshot) => {
      const requestsList1 = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(prevState => [...prevState, ...requestsList1]);
    });

    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      const requestsList2 = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(prevState => [...prevState, ...requestsList2]);
    });


    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  };

  // Función para obtener la lista de personas que el usuario puede descubrir
  const fetchPeopleToDiscover = () => {
    setPeopleToDiscover([]);
  
    const currentUser = props.username;
  
    const q = query(collection(db, 'friendRequests'),
      where('status', '==', 'accepted'),
      where('receiver', '==', currentUser));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const friendsList = querySnapshot.docs.map(doc => doc.data().sender);
  
      onSnapshot(collection(db, 'users'), (querySnapshot) => {
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), requestSent: false }));
  
        // Filtrar usuarios para excluir a los amigos del usuario actual
        const peopleToDiscoverList = usersList.filter(user =>
          !friendsList.includes(user.username) && user.username !== currentUser
        );
  
        // Filtrar personas por descubrir para excluir las solicitudes enviadas
        const filteredPeopleToDiscoverList = peopleToDiscoverList.filter(person =>
          !friendRequests.some(request =>
            (request.sender === person.username && request.receiver === currentUser) ||
            (request.receiver === person.username && request.sender === currentUser)
          )
        );
  
        setPeopleToDiscover(filteredPeopleToDiscoverList);
      });
    });
  
    return unsubscribe;
  };

   // Función para obtener la lista de solicitudes de amistad del usuario
  const fetchFriendRequests = () => {
    setFriendRequests([]);

    const currentUser = props.username;
    const q = query(collection(db, 'friendRequests'),
      and(where('status', '==', 'pending'), // Cambiar a 'pending'
        or(where('receiver', '==', currentUser), where('sender', '==', currentUser))));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriendRequests(requestsList);
    });
    return unsubscribe;
  };

  const fetchAllPeople = () => {
    setAllPeople([]);
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllPeople(usersList);
    });
  }
  // Efecto para realizar las consultas de amigos, personas por descubrir y solicitudes de amistad cuando el componente se monta
  useEffect(() => {
    const unsubscribeFriends = fetchFriends();
    const unsubscribePeopleToDiscover = fetchPeopleToDiscover();
    const unsubscribeFriendRequests = fetchFriendRequests();

    fetchAllPeople();
    
    return () => {
      unsubscribeFriends();
      unsubscribePeopleToDiscover();
      unsubscribeFriendRequests();
    };
  }, []);

  const handleClose = () => {
    if (props.onHide) {
      props.onHide();
    }
  };

  return (
    <Offcanvas show={props.show} onHide={handleClose} className="animated-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Conexiones</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Tabs
          defaultActiveKey="friendships"
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3"
        >
          <Tab eventKey="friendships" title="Tus Amigos">
            <ul className="discover-list">
              {friends.map((request) => {
                const person = allPeople.find(person => (
                  person.username === (request.sender === props.username ? request.receiver : request.sender)
                ));

                return (
                  <div key={request.id} className="animated-person mb-3">
                    <Card onClick={() => window.location.href = `/profile/${person.username}`}>
                      <Card.Body>
                        <img
                          src={`https://firebasestorage.googleapis.com/v0/b/db-proykim.appspot.com/o/profilePictures%2F${person?.email}%2F${person?.username}_pp?alt=media`}
                          alt={`Foto de perfil de ${person?.username}`}
                          className="profile-img"
                        />
                        {person?.username}
                      </Card.Body>
                    </Card>
                  </div>
                )
              })}
            </ul>
          </Tab>
          <Tab eventKey="discover" title="Personas por descubrir">
            <ul className="discover-list">
              {peopleToDiscover.map((person, index) => (
                <div key={index} className="animated-person">
                  <Card>
                    <Card.Body>
                      <img
                        src={`https://firebasestorage.googleapis.com/v0/b/db-proykim.appspot.com/o/profilePictures%2F${person.email}%2F${person.username}_pp?alt=media`}
                        alt={`Foto de perfil de ${person.username}`}
                        className="profile-img"
                      />
                      {person.username}
                    </Card.Body>
                    <Card.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {/* Mostrar el botón "Solicitud enviada" si la persona ya ha sido solicitada */}
                      {!person.requestSent ? (
                        <Button variant="success" onClick={() => handleFriendRequest(person.username)}>
                          Enviar Solicitud
                        </Button>
                      ) : (
                        <Button variant="secondary" disabled>
                          Solicitud Enviada
                        </Button>
                      )}
                    </Card.Footer>
                  </Card>
                  <br />
                </div>
              ))}
            </ul>
          </Tab>
          <Tab eventKey="friendRequests" title="Interacciones de amistad">
            <ul className="discover-list">
              {friendRequests.map((request) => {
                return (
                  <div key={request.id} className="animated-person mb-3">
                    <Card>
                      <Card.Body>
                        {request.sender} ha enviado una solicitud de conexión a {request.receiver}.
                      </Card.Body>
                      <Card.Footer>
                        {(request.sender !== props.username) &&
                          <Button variant="success" onClick={() => handleAcceptRequest(request)}>
                            <PersonFillAdd color="white" size={20} />
                          </Button>}

                        <Button variant="danger" onClick={() => handleRejectRequest(request)}>
                          <Ban color="white" size={20} />
                        </Button>


                      </Card.Footer>
                    </Card>
                  </div>
                )
              })}
            </ul>
          </Tab>
        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
}


export default FriendsOffcanvas;
