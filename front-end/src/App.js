import React, { useState, useEffect} from "react";
import io from "socket.io-client";

const socket = io('http://localhost:5001');

const App = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState('');
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/rooms')
        .then(res => res.json())
        .then(data => setRooms(data));

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('userList', (users) => {
      setUserList(users);
    });

    return () => {
      socket.off('message');
      socket.off('userList');
    }
  }, []);

  const joinRoom = (room) => {
    if (user.trim() === '') {
      alert('Please enter a username');
      return;
    }
    socket.emit('joinRoom', room, user);
    setCurrentRoom(room)
    setMessages([]);
  }

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', message);
      setMessage('');
    }
  };

  return (
      <div>
        <h1> Chat App</h1>

        {!currentRoom ? (
            <div>
              <input type="text" placeholder="Enter your username" value={user}
                     onChange={(e) => setUser(e.target.value)}/>
              <h2>Rooms</h2>
              <ul>
                {rooms.map((room, index) => (
                    <li key={index} onClick={() => joinRoom(room)}>{room}</li>
                ))}
              </ul>
            </div>
        ) : (
            <div>
              <h2>{currentRoom}</h2>
              <h2>{userList.length} users in room: </h2>
              <div>
                <h3> Who's online:</h3>
                <ul>
                  {userList.map((user, index) => (
                      <li key={index}>{user}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div>
                  {messages.map((message, index) => (
                      <p key={index}>{message}</p>
                  ))}
                </div>
                <input type="text" placeholder="Type a message" value={message}
                       onChange={(e) => setMessage(e.target.value)}/>
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
        )}
      </div>
  );
};

export default App;
