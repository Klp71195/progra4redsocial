import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { PostList, userPost } from '../firebase/api';
import './feed.css';
import FriendsOffcanvas from './friendsoffcanvas';

function Feed(props) {
  const [postPicture, setPostPicture] = useState(null);
  const [description, setDescription] = useState('');
  const [refreshPosts, setRefreshPosts] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  

  const handlePostSubmit = async (e) => { // Define la función handlePostSubmit
    e.preventDefault(); // Evita el comportamiento predeterminado del formulario
    setIsPosting(true);
    try {
      if (!postPicture) { // Si no hay una imagen seleccionada
        throw new Error('Por favor, seleccione una imagen.'); // Lanza un error
      }
      const username = props.username; // Obtiene el nombre de usuario de props
      const email = props.userEmail; // Obtiene el correo electrónico de usuario de props
      await userPost(username, email, postPicture, description);
      setPostPicture(null);
      setRefreshPosts(true);
    } catch (error) {
      console.error('Error al publicar: ', error);
    } finally {
      setIsPosting(false); // Establece isPosting como false independientemente del resultado
    }
  };

  const handleFileChange = (e) => { // Define la función handleFileChange
    const file = e.target.files[0]; // Obtiene el archivo seleccionado del evento
    setPostPicture(file); // Establece el estado de la imagen con el archivo seleccionado
  };

  useEffect(() => { // Define el efecto que se ejecuta cuando cambia refreshPosts o description
    console.log('Efecto de Feed activado.');
    if (refreshPosts) { // Si refreshPosts es true
      console.log('Se ejecutó el efecto de PostList debido a un cambio en refresh'); // Registra en la consola que se ejecutó el efecto de PostList debido a un cambio en refresh
      setRefreshPosts(true); // Establece refreshPosts como true (esto parece innecesario y puede ser un error)
      console.log('SetrefreshTrue'); // Registra en la consola que se estableció refresh como true
    }
  }, [refreshPosts, description]);

  return <>
          
    <div className="container-fluid" id="home">
        
          <h1 className="text-center text-primary">Bienvenidos Programadores</h1>
          
            <div className='text-center'>
            
            <Card className="post-form">
              <Card.Header className="text-center" style={{color: 'navy'}}>Publica una imagen </Card.Header>
              <Card.Body>
                <Form onSubmit={handlePostSubmit}>
                  <Form.Group controlId="formBasicDescription">
                    <Form.Control type="text" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </Form.Group>
                  <Form.Group controlId="formBasicProfilePicture">
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    <Form.Text className="text-muted">Seleccione una imagen para publicar.</Form.Text>
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={isPosting}>
                    {isPosting ? 'Publicando...' : 'Publicar'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            
          
            <h2 className='text-center text-primary'>Publicaciones recientes</h2>
            <PostList refresh={refreshPosts} currentUser={props.username} />
        </div>
      </div>
      <FriendsOffcanvas show={props.showFriendsOffcanvas} onHide={() => props.setShowFriendsOffcanvas(false)} username={props.username} />
  </>;
}

export default Feed;
