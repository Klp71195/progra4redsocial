import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import './App.css';
import Feed from './components/feed';
import MyNavbar from './components/navbar';
import Navbar_log from './components/navbar_logged';
import Sidebar from './components/sidebar';


function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showBlankForm, setShowBlankForm] = useState(false); // Nuevo estado para controlar la visibilidad del formulario en blanco
  const [showFriendsOffcanvas, setShowFriendsOffcanvas] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserAuthenticated(true);
      setUserData(JSON.parse(user));
    }

    if (showBlankForm) { // Si showBlankForm es true
      setUserAuthenticated(false); // Establece userAuthenticated como false
      setUserData(null); // Establece userData como null
    }

    if (!user) {
      window.location.href = '/login'; // Replace '/login' with the actual login route
    }


  }, []);

  const handleFriendsClick = () => { // Define la función handleFriendsClick
    setShowFriendsOffcanvas(true);
  };

  return (
    <>
      {userAuthenticated ? <Sidebar onFriendsClick={handleFriendsClick} /> : null}
      {userAuthenticated ? <Navbar_log username={userData.username} userEmail={userData.email} showBlankForm={showBlankForm} /> : <MyNavbar />}
      <Container className='mt-2'>
        {userAuthenticated && <Feed username={userData.username} userEmail={userData.email} showFriendsOffcanvas={showFriendsOffcanvas} setShowFriendsOffcanvas={setShowFriendsOffcanvas} />}
      </Container>
    </>
  );
}

export default App;
