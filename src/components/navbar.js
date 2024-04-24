import React from 'react'; // Importa React para poder utilizar componentes de React
import Navbar from 'react-bootstrap/Navbar'; // Importa el componente Navbar de react-bootstrap
import './navbar.css'; // Importa el archivo CSS para estilizar el Navbar

function MyNavbar() { // Declara el componente MyNavbar
  return ( // Retorna la estructura del Navbar
    <Navbar bg="dark" variant="dark"> {/* Define un Navbar con fondo oscuro y variant dark */}
      {/* <Container> Utiliza un Container para contener los elementos del Navbar */}
      <Navbar.Brand href="/">PHOTOBOOKCODE</Navbar.Brand> {/* Define la marca del Navbar con el texto "PhotoViewer" y un enlace al '#home' */}
      {/* </Container> */}
    </Navbar>
  );
}

export default MyNavbar; // Exporta el componente MyNavbar para que pueda ser utilizado en otros archivos
