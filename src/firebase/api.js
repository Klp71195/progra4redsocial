import { addDoc, collection, getDocs, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Button, Card, Form, ListGroup, Modal } from 'react-bootstrap';
import { ChatLeftText, HeartFill, PersonFill, SendFill } from 'react-bootstrap-icons'; // Importa el ícono de persona
import { db, storage } from './config';

export const getUserDataByUserName = async (username) => {
  try {
    const usersCollection = collection(db, 'users');

    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    } else {
      const data = querySnapshot.docs[0].data();
      return data;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}
// Función para enviar una solicitud de amistad
export const sendFriendRequest = async (receiver, sender) => {
  try {
    const docRef = await addDoc(collection(db, 'friendRequests'), {
      receiver: receiver,
      sender: sender,
      status: 'pending',
    })

    return docRef.id;
  } catch (error) {
    console.error('Error al agregar documento:', error);
    throw error;
  }
}

// Función para guardar los datos del usuario
export const saveUserData = async (username, email, password, profilePicture, description) => {
  try {
    const storageRef = ref(storage, `profilePictures/${email}/${username}_pp`);
    await uploadBytes(storageRef, profilePicture);
    const profilePictureURL = await getDownloadURL(storageRef);
    const docRef = await addDoc(collection(db, 'users'), {
      username: username,
      email: email,
      password: password,
      profilePictureURL: profilePictureURL,
      description: description // Incluir la descripción del usuario en los datos guardados
    });
    console.log('Documento con ID:', docRef.id, 'agregado correctamente');
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar documento:', error);
    throw error;
  }
};


// Función para encontrar un usuario por su correo electrónico
export const findUserByEmail = async (email) => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    } else {
      const data = querySnapshot.docs[0].data();
      return data;
    }
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    throw error;
  }
};

// Función para publicar un usuario
export const userPost = async (username, email, postPicture, description) => {
  try {
    const postId = generateUniqueId();
    const date = new Date();
    const postDate = moment(date).format('MMMM Do YYYY, h:mm:ss a');
    const storageRef = ref(storage, `usersPost/${email}/${username}/${date}_post`);
    await uploadBytes(storageRef, postPicture);
    const postPictureURL = await getDownloadURL(storageRef);
    const docRef = await addDoc(collection(db, 'posts'), {
      id: postId,
      username: username,
      email: email,
      postPictureURL: postPictureURL,
      description: description,
      postDate: date
    });
    return postId;
  } catch (error) {
    throw error;
  }
};

// Función para generar un ID único
const generateUniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

export function PostList({ refresh, currentUser, onlyUserPosts }) {
  const [posts, setPosts] = useState([]);
  const [likesCounts, setLikesCounts] = useState({});
  const [userLikedPosts, setUserLikedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentsCount, setCommentsCount] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [commentLikesCounts, setCommentLikesCounts] = useState({});
  const [userLikedComments, setUserLikedComments] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await findUserByEmail(currentUser);
        setCurrentUserData(userData);
      } catch (error) {
        console.error('Error fetching current user data: ', error);
      }
    };
    fetchCurrentUser();
  }, [currentUser]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'posts'), orderBy('postDate', 'desc')));
        const postList = [];
        querySnapshot.forEach((doc) => {
          const post = {
            id: doc.id,
            ...doc.data()
          };
          postList.push(post);
        });
        setPosts(postList);
      } catch (error) {
        console.error('Error fetching posts: ', error);
      }
    };
    fetchPosts();
    
  }, [refresh]);

  const sortedPosts = [...posts].filter((post) => {
    if (onlyUserPosts) {
      return post.username === currentUser;
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.postDate);
    const dateB = new Date(b.postDate);

    return dateB - dateA;
  });


  const fetchPostLikes = async (postId) => {
    try {
      const postLikesQuery = query(collection(db, 'postLikes'), where('postId', '==', postId));
      const postLikesSnapshot = await getDocs(postLikesQuery);
      return postLikesSnapshot.size;
    } catch (error) {
      console.error('Error fetching post likes: ', error);
      return 0;
    }
  };

  const fetchUserLikedPosts = async () => {
    try {
      const userLikedPostsQuery = query(collection(db, 'postLikes'), where('userId', '==', currentUser));
      const userLikedPostsSnapshot = await getDocs(userLikedPostsQuery);
      const likedPosts = userLikedPostsSnapshot.docs.map((doc) => doc.data().postId);
      setUserLikedPosts(likedPosts);
    } catch (error) {
      console.error('Error fetching user liked posts: ', error);
    }
  };

  const fetchCurrentUserPosts = async () => {
    try {
      if (!currentUserData) return [];
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const userPosts = [];
      querySnapshot.forEach((doc) => {
        const post = {
          id: doc.id,
          ...doc.data()
        };
        if (post.username === currentUserData.username) {
          userPosts.push(post);
        }
      });
      userPosts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
      return userPosts;
    } catch (error) {
      console.error('Error fetching user posts: ', error);
      return [];
    }
  };

  const fetchCommentsForPost = async (postId) => {
    try {
      const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = await Promise.all(commentsSnapshot.docs.map(async (doc) => {
        const commentData = doc.data();
        const userData = await findUserByEmail(commentData.userId);
        const userProfilePictureURL = userData ? userData.profilePictureURL : '';
        const likesCount = await fetchCommentLikesCount(doc.id);
        return {
          id: doc.id,
          userProfilePictureURL: userProfilePictureURL,
          likes: likesCount,
          ...commentData
        };
      }));
      const commentsCount = commentsSnapshot.size;
      setCommentsCount((prevCommentsCount) => ({
        ...prevCommentsCount,
        [postId]: commentsCount
      }));
      return commentsData;
    } catch (error) {
      console.error('Error fetching comments: ', error);
      return [];
    }
  };

  const fetchCommentLikesCount = async (commentId) => {
    try {
      const likesQuery = query(collection(db, 'commentLikes'), where('commentId', '==', commentId));
      const likesSnapshot = await getDocs(likesQuery);
      return likesSnapshot.size;
    } catch (error) {
      console.error('Error fetching comment likes count: ', error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchLikesCounts = async () => {
      const likesCounts = {};
      await Promise.all(
        posts.map(async (post) => {
          const likesCount = await fetchPostLikes(post.id);
          likesCounts[post.id] = likesCount;
        })
      );
      setLikesCounts(likesCounts);
    };

    fetchLikesCounts();
    fetchUserLikedPosts();
  }, [posts, currentUser]);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsMap = {};
      await Promise.all(
        posts.map(async (post) => {
          const postComments = await fetchCommentsForPost(post.id);
          commentsMap[post.id] = postComments;
        })
      );
      setComments(commentsMap);
    };

    fetchComments();
  }, [posts]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const userPosts = await fetchCurrentUserPosts();
      setPosts(userPosts);
    };
    fetchUserPosts();
  }, [refresh, currentUserData]);

  useEffect(() => {
    const unsubscribeCommentLikes = onSnapshot(collection(db, 'commentLikes'), (snapshot) => {
      const commentLikesCountsMap = {};
      snapshot.forEach((doc) => {
        const commentId = doc.data().commentId;
        if (commentLikesCountsMap[commentId]) {
          commentLikesCountsMap[commentId]++;
        } else {
          commentLikesCountsMap[commentId] = 1;
        }
      });
      setCommentLikesCounts(commentLikesCountsMap);
    });

    return () => unsubscribeCommentLikes();
  }, []);

  const handleLikeClick = async (postId) => {
    try {
      if (userLikedPosts.includes(postId)) {
        console.log('El usuario ya le dio like a este post');
        return;
      }

      await addDoc(collection(db, 'postLikes'), {
        userId: currentUser,
        postId: postId
      });

      const updatedLikesCount = await fetchPostLikes(postId);
      setLikesCounts((prevLikesCounts) => ({
        ...prevLikesCounts,
        [postId]: updatedLikesCount
      }));
      setUserLikedPosts((prevUserLikedPosts) => [...prevUserLikedPosts, postId]);
    } catch (error) {
      console.error('Error al dar like al post: ', error);
    }
  };

  const handleChatClick = (postId) => {
    setSelectedPostId(postId);
    setShowModal(true);
  };

  const handleCommentTextChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleSendComment = async (postId) => {
    try {
      const commentId = generateUniqueId();
      await addDoc(collection(db, 'comments'), {
        id: commentId,
        postId: postId,
        userId: currentUser,
        username: currentUser,
        comment: commentText,
        timestamp: new Date()
      });
      console.log('Comentario agregado correctamente.');
      setCommentText('');
      const updatedComments = await fetchCommentsForPost(postId);
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: updatedComments
      }));
      setCommentsCount((prevCommentsCount) => ({
        ...prevCommentsCount,
        [postId]: (prevCommentsCount[postId] || 0) + 1
      }));
    } catch (error) {
      console.error('Error al enviar el comentario: ', error);
    }
  };


  const handleCommentLikeClick = async (commentId) => {
    try {
      if (userLikedComments.includes(commentId)) {
        console.log('El usuario ya le dio like a este comentario');
        return;
      }

      await addDoc(collection(db, 'commentLikes'), {
        userId: currentUser,
        commentId: commentId
      });

      setUserLikedComments((prevUserLikedComments) => [...prevUserLikedComments, commentId]);

      const updatedLikesCount = await fetchCommentLikesCount(commentId);

      setCommentLikesCounts((prevCommentLikesCounts) => ({
        ...prevCommentLikesCounts,
        [commentId]: updatedLikesCount
      }));
    } catch (error) {
      console.error('Error al dar like al comentario: ', error);
    }
  };

  const commentLikedByCurrentUser = (commentId) => {
    return userLikedComments.includes(commentId);
  };



  return (
    <div className="post-list justify-center">
      {sortedPosts.map((post) => (
        <div key={post.id}>
          <br />
          <Card>
            <Card.Header>
              <img
                alt=""
                src={`https://firebasestorage.googleapis.com/v0/b/db-proykim.appspot.com/o/profilePictures%2F${post.email}%2F${post.username}_pp?alt=media`}
                width="30"
                height="30"
                style={{ borderRadius: '100%', display: 'inline-block' }}
                className="d-inline-block align-left"
              />
              <h5 className="card-title ml-3" style={{ display: 'inline-block'}}>{post.username}</h5>
            </Card.Header>
            <div className="card-body">
              <p>{post.description}</p>
              <img src={post.postPictureURL} className="card-img-top" alt="Post" style={{maxWidth: '350px', minHeight: '300px'}}/>
            </div>
            <Card.Footer>
              <HeartFill
                color={userLikedPosts.includes(post.id) ? 'red' : 'gray'}
                size={20}
                onClick={() => handleLikeClick(post.id)}
                style={{ cursor: 'pointer', marginRight: '10px' }}
              /> {likesCounts[post.id]} Likes
              <ChatLeftText color='gray'
                size={20}
                onClick={() => handleChatClick(post.id)}
                style={{ cursor: 'pointer', marginLeft: '20px' }} />
              <span style={{ marginLeft: '10px' }}>{commentsCount[post.id] || 0} Comentarios</span>

              <div className="comments-list" style={{ marginTop: '20px' }}>
                <ListGroup>
                  {comments[post.id] && comments[post.id].map((comment, index) => (
                    <ListGroup.Item key={index} style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PersonFill // Cambio de la imagen de perfil por el ícono de persona
                          color="gray"
                          size={20}
                          style={{ marginRight: '10px' }}
                        />
                        <p style={{ display: 'inline-block', flex: '1', margin: '0', lineHeight: '1.5' }}>
                          <strong>{comment.username}: </strong>{comment.comment}
                        </p>
                        <div>
                          <HeartFill
                            color={commentLikedByCurrentUser(comment.id) ? 'red' : 'gray'}
                            size={20}
                            onClick={() => handleCommentLikeClick(comment.id)}
                            style={{ cursor: 'pointer', marginRight: '10px' }}
                          /> {commentLikesCounts[comment.id] || 0}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Comentar..."
                  value={commentText}
                  onChange={handleCommentTextChange}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  style={{ marginTop: '15px' }}
                  onClick={() => handleSendComment(post.id)}
                >
                  <SendFill size={20} style={{ marginBottom: '3px', marginRight: '5px' }} /> Enviar
                </Button>
              </Form.Group>
            </Card.Footer>
          </Card>
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Comentarios</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ListGroup>
                {comments[selectedPostId] && comments[selectedPostId].map((comment, index) => (
                  <ListGroup.Item key={index} style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <PersonFill // Cambio de la imagen de perfil por el ícono de persona
                        color="gray"
                        size={20}
                        style={{ marginRight: '10px' }}
                      />
                      <p style={{ display: 'inline-block', flex: '1', margin: '0', lineHeight: '1.5' }}>
                        <strong>{comment.username}: </strong>{comment.comment}
                      </p>
                      <div>
                        <HeartFill
                          color={commentLikedByCurrentUser(comment.id) ? 'red' : 'gray'}
                          size={20}
                          onClick={() => handleCommentLikeClick(comment.id)}
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                        /> {commentLikesCounts[comment.id] || 0}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Modal.Body>
          </Modal>
        </div>
      ))}
    </div>
  );
}

export default PostList;
