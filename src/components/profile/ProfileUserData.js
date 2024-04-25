import 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PostList, { getUserDataByUserName } from '../../firebase/api';
import FriendsOffcanvas from '../friendsoffcanvas';
import Navbar_log from '../navbar_logged';
import Sidebar from '../sidebar';
import './ProfileUserData.css';

export const ProfileUserData = () => {
    // Obtener el nombre de usuario de los parámetros de la URL
    const [user, setUser] = useState({ email: '', username: '', profilePictureURL: '', description: '' });
    const [currentUser, setCurrentUser] = useState({});
    const [showFriendsOffcanvas, setShowFriendsOffcanvas] = useState(false);
    const { userName } = useParams();

    const handleFriendsClick = () => { // Define la función handleFriendsClick
        setShowFriendsOffcanvas(true);
    };


    useEffect(() => {
        getUserDataByUserName(userName).then((userData) => {
            setUser(userData);
        });

        const user = JSON.parse(window.localStorage.getItem('user'));

        setCurrentUser(user);
    }, [userName]);

    return (
        <>
            <Sidebar onFriendsClick={handleFriendsClick} /> { }
            <Navbar_log username={currentUser.username} userEmail={currentUser.email} />
            <Container className='mt-2'>
                <div className="col-md-2"> { }
                </div>
                <h1 className='text-primary'>Perfil de Usuario</h1>
                <img src={user.profilePictureURL} alt="This profile picture dont exist to this user" className="profile-picture" />
                <h5 className='text-primary'>Nombre de Usuario: {user.username}</h5>
                <h5 className='text-primary'>Correo Electrónico: {user.email}</h5>
                <h5 className='text-primary'>Descripción: {user.description}</h5> 

                {/* Post del perfil */}
                <PostList currentUser={user.username} onlyUserPosts={true} />
                {
                    /* Componente de offcanvas para mostrar amigos */
                    currentUser.username ? <FriendsOffcanvas show={showFriendsOffcanvas} onHide={() => setShowFriendsOffcanvas(false)} username={currentUser.username} /> : null
                }

            </Container>
        </>
    );
};
