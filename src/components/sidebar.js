
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import './sidebar.css';
import Photobook from './home/images/Photobook.png';
function Sidebar(props) {
  // Estado para controlar si la barra lateral está expandida o no
  const [isExpanded, setIsExpanded] = useState(false);

  // Función para alternar la expansión de la barra lateral
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Elementos de la barra lateral
  const sidebarItems = [
    { title: 'Publicaciones destacas', link: '/', icon: 'fas fa-home' },
    { title: 'Conexiones', onClick: props.onFriendsClick, icon: 'fas fa-user-friends' },
    // { title: 'Interacciones', link: '/settings', icon: 'fas fa-cog' }
  ];

  return (<>
    <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header my-2" onClick={toggleSidebar}>
          <img src={Photobook} alt="Logo" className="sidebar-logo" width={'65px'} height={'65px'} style={{ borderRadius: '65px' }} />
        </div>
      <Nav defaultActiveKey="/home" className={`flex-column ${isExpanded ? 'show' : ''}`}>
        {sidebarItems.map((item, index) => (
          <Nav.Link key={index} href={item.link} onClick={item.onClick}>
            <i className={item.icon}></i>
            {item.title}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  </>
  );
}

export default Sidebar;
