// // src/pages/EditorPage.js

// import React, { useState, useRef, useEffect } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { io } from 'socket.io-client'; // Import io from socket.io-client
// import ACTIONS from '../Actions';
// import Editor from '../components/Editor';
// import toast, { Toaster } from 'react-hot-toast';
// import { gsap } from 'gsap';
// import { FaCopy } from 'react-icons/fa'; // Import copy icon

// const EditorPage = () => {
//   const socketRef = useRef(null);
//   const codeRef = useRef('');
//   const { roomId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const editorRef = useRef(null);
//   const asideRef = useRef(null);

//   useEffect(() => {
//     gsap.from(editorRef.current, {
//       opacity: 0,
//       duration: 1,
//       x: 100,
//       ease: 'power3.out',
//     });
//     gsap.from(asideRef.current, {
//       opacity: 0,
//       duration: 1,
//       x: -100,
//       ease: 'power3.out',
//     });
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       socketRef.current = io('http://localhost:5000'); // Adjust if using a different host

//       socketRef.current.on('connect_error', (err) => handleErrors(err));
//       socketRef.current.on('connect_failed', (err) => handleErrors(err));

//       function handleErrors(e) {
//         console.error('Socket error:', e);
//         toast.error('Socket connection failed, try again later.');
//         navigate('/');
//       }

//       socketRef.current.emit(ACTIONS.JOIN, {
//         roomId,
//         username: location.state?.username,
//       });

//       // Listening for joined event
//       socketRef.current.on(
//         ACTIONS.JOINED,
//         ({ clients, username, socketId }) => {
//           if (username !== location.state?.username) {
//             toast.success(`${username} joined the room.`);
//           }
//           setClients(clients);
//           socketRef.current.emit(ACTIONS.SYNC_CODE, {
//             code: codeRef.current,
//             socketId,
//           });
//         }
//       );

//       // Listening for disconnected users
//       socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
//         toast(`${username} left the room.`, {
//           icon: '👋',
//         });
//         setClients((prev) => {
//           return prev.filter((client) => client.socketId !== socketId);
//         });
//       });
//     };
//     init();

//     return () => {
//       socketRef.current.disconnect();
//       socketRef.current.off(ACTIONS.JOINED);
//       socketRef.current.off(ACTIONS.DISCONNECTED);
//     };
//   }, [navigate, roomId, location.state]);

//   if (!location.state) {
//     navigate('/');
//     return null;
//   }

//   // Function to copy Room ID to clipboard
//   const copyRoomId = async () => {
//     try {
//       await navigator.clipboard.writeText(roomId);
//       toast.success('Room ID copied to clipboard!');
//     } catch (err) {
//       console.error('Failed to copy: ', err);
//       toast.error('Failed to copy Room ID.');
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       <Toaster position="top-right" />
//       <aside
//         ref={asideRef}
//         className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between"
//       >
//         {/* Top Section: Copy Room ID Button */}
//         <div>
//           <button
//             onClick={copyRoomId}
//             className="flex items-center bg-gray-700 hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded mb-6"
//             title="Copy Room ID"
//           >
//             <FaCopy className="mr-2" />
//             Copy Room ID
//           </button>

//           {/* Connected Users */}
//           <h2 className="text-2xl font-semibold mb-4">Connected Users</h2>
//           <ul>
//             {clients.map((client) => (
//               <li key={client.socketId} className="mb-4 flex items-center">
//                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                   <span className="text-xl font-bold uppercase">
//                     {client.username.charAt(0)}
//                   </span>
//                 </div>
//                 <span className="ml-3">{client.username}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Leave Room Button */}
//         <button
//           onClick={() => navigate('/')}
//           className="w-full py-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
//         >
//           Leave Room
//         </button>
//       </aside>
//       <main ref={editorRef} className="flex-1 bg-gray-800">
//         <Editor
//           socketRef={socketRef}
//           roomId={roomId}
//           onCodeChange={(code) => {
//             codeRef.current = code;
//           }}
//         />
//       </main>
//     </div>
//   );
// };

// export default EditorPage;
















































// // src/pages/EditorPage.js

// import React, { useState, useRef, useEffect } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { io } from 'socket.io-client'; // Import io from socket.io-client
// import ACTIONS from '../Actions';
// import Editor from '../components/Editor';
// import toast, { Toaster } from 'react-hot-toast';
// import { gsap } from 'gsap';
// import { FaCopy } from 'react-icons/fa'; // Import copy icon

// const EditorPage = () => {
//   const socketRef = useRef(null);
//   const codeRef = useRef(''); // Initialize codeRef
//   const { roomId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const editorRef = useRef(null);
//   const asideRef = useRef(null);

//   useEffect(() => {
//     gsap.from(editorRef.current, {
//       opacity: 0,
//       duration: 1,
//       x: 100,
//       ease: 'power3.out',
//     });
//     gsap.from(asideRef.current, {
//       opacity: 0,
//       duration: 1,
//       x: -100,
//       ease: 'power3.out',
//     });
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       socketRef.current = io('http://localhost:5000'); // Adjust if using a different host

//       socketRef.current.on('connect_error', (err) => handleErrors(err));
//       socketRef.current.on('connect_failed', (err) => handleErrors(err));

//       function handleErrors(e) {
//         console.error('Socket error:', e);
//         toast.error('Socket connection failed, try again later.');
//         navigate('/');
//       }

//       socketRef.current.emit(ACTIONS.JOIN, {
//         roomId,
//         username: location.state?.username,
//       });

//       // Listening for joined event
//       socketRef.current.on(
//         ACTIONS.JOINED,
//         ({ clients, username, socketId }) => {
//           if (username !== location.state?.username) {
//             toast.success(`${username} joined the room.`);
//           }
//           setClients(clients);
//           socketRef.current.emit(ACTIONS.SYNC_CODE, {
//             code: codeRef.current,
//             socketId,
//           });
//         }
//       );

//       // Listening for code synchronization
//       socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
//         if (codeRef.current === '') {
//           codeRef.current = code;
//           // Emit a CODE_CHANGE event to update other clients
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       });

//       // Listening for code changes from other clients
//       socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//         codeRef.current = code;
//       });

//       // Listening for disconnected users
//       socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
//         toast(`${username} left the room.`, {
//           icon: '👋',
//         });
//         setClients((prev) => {
//           return prev.filter((client) => client.socketId !== socketId);
//         });
//       });
//     };
//     init();

//     return () => {
//       socketRef.current.disconnect();
//       socketRef.current.off(ACTIONS.JOINED);
//       socketRef.current.off(ACTIONS.DISCONNECTED);
//       socketRef.current.off(ACTIONS.SYNC_CODE);
//       socketRef.current.off(ACTIONS.CODE_CHANGE);
//     };
//   }, [navigate, roomId, location.state]);

//   if (!location.state) {
//     navigate('/');
//     return null;
//   }

//   // Function to copy Room ID to clipboard
//   const copyRoomId = async () => {
//     try {
//       await navigator.clipboard.writeText(roomId);
//       toast.success('Room ID copied to clipboard!');
//     } catch (err) {
//       console.error('Failed to copy: ', err);
//       toast.error('Failed to copy Room ID.');
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       <Toaster position="top-right" />
//       <aside
//         ref={asideRef}
//         className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between"
//       >
//         {/* Top Section: Copy Room ID Button */}
//         <div>
//           <button
//             onClick={copyRoomId}
//             className="flex items-center bg-gray-700 hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded mb-6"
//             title="Copy Room ID"
//           >
//             <FaCopy className="mr-2" />
//             Copy Room ID
//           </button>

//           {/* Connected Users */}
//           <h2 className="text-2xl font-semibold mb-4">Connected Users</h2>
//           <ul>
//             {clients.map((client) => (
//               <li key={client.socketId} className="mb-4 flex items-center">
//                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                   <span className="text-xl font-bold uppercase">
//                     {client.username.charAt(0)}
//                   </span>
//                 </div>
//                 <span className="ml-3">{client.username}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Leave Room Button */}
//         <button
//           onClick={() => navigate('/')}
//           className="w-full py-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
//         >
//           Leave Room
//         </button>
//       </aside>
//       <main ref={editorRef} className="flex-1 bg-gray-800">
//         <Editor
//           socketRef={socketRef}
//           roomId={roomId}
//           onCodeChange={(code) => {
//             codeRef.current = code;
//           }}
//           codeRef={codeRef} // Pass codeRef as a prop
//         />
//       </main>
//     </div>
//   );
// };

// export default EditorPage;
























// // src/pages/EditorPage.js

// import React, { useState, useRef, useEffect } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { io } from 'socket.io-client'; // Import io from socket.io-client
// import ACTIONS from '../Actions';
// import Editor from '../components/Editor';
// import toast, { Toaster } from 'react-hot-toast';
// import { gsap } from 'gsap';
// import { FaCopy } from 'react-icons/fa'; // Import copy icon

// const EditorPage = () => {
//   const socketRef = useRef(null);
//   const codeRef = useRef(''); // Initialize codeRef
//   const { roomId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const editorRef = useRef(null);
//   const asideRef = useRef(null);

//   useEffect(() => {
//     gsap.from(editorRef.current, {
//       opacity: 0,
//       duration: 1,
//       x: 100,
//       ease: 'power3.out',
//     });
//     gsap.from(asideRef.current, {
//       opacity: 0,
//       duration: 1,
//       x: -100,
//       ease: 'power3.out',
//     });
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       socketRef.current = io('http://localhost:5000'); // Adjust if using a different host

//       socketRef.current.on('connect_error', (err) => handleErrors(err));
//       socketRef.current.on('connect_failed', (err) => handleErrors(err));

//       function handleErrors(e) {
//         console.error('Socket error:', e);
//         toast.error('Socket connection failed, try again later.');
//         navigate('/');
//       }

//       socketRef.current.emit(ACTIONS.JOIN, {
//         roomId,
//         username: location.state?.username,
//       });

//       // Listening for joined event
//       socketRef.current.on(
//         ACTIONS.JOINED,
//         ({ clients, username, socketId }) => {
//           if (username !== location.state?.username) {
//             toast.success(`${username} joined the room.`);
//           }
//           setClients(clients);
//           socketRef.current.emit(ACTIONS.SYNC_CODE, {
//             code: codeRef.current,
//             socketId,
//           });
//         }
//       );

//       // Listening for code synchronization
//       socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
//         if (codeRef.current === '') {
//           codeRef.current = code;
//           // Emit a CODE_CHANGE event to update other clients
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       });

//       // Listening for code changes from other clients
//       socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//         codeRef.current = code;
//       });

//       // Listening for disconnected users
//       socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
//         toast(`${username} left the room.`, {
//           icon: '👋',
//         });
//         setClients((prev) => {
//           return prev.filter((client) => client.socketId !== socketId);
//         });
//       });
//     };
//     init();

//     return () => {
//       socketRef.current.disconnect();
//       socketRef.current.off(ACTIONS.JOINED);
//       socketRef.current.off(ACTIONS.DISCONNECTED);
//       socketRef.current.off(ACTIONS.SYNC_CODE);
//       socketRef.current.off(ACTIONS.CODE_CHANGE);
//     };
//   }, [navigate, roomId, location.state]);

//   if (!location.state) {
//     navigate('/');
//     return null;
//   }

//   // Function to copy Room ID to clipboard
//   const copyRoomId = async () => {
//     try {
//       await navigator.clipboard.writeText(roomId);
//       toast.success('Room ID copied to clipboard!');
//     } catch (err) {
//       console.error('Failed to copy: ', err);
//       toast.error('Failed to copy Room ID.');
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       <Toaster position="top-right" />
//       <aside
//         ref={asideRef}
//         className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between"
//       >
//         {/* Top Section: Copy Room ID Button */}
//         <div>
//           <button
//             onClick={copyRoomId}
//             className="flex items-center bg-gray-700 hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded mb-6"
//             title="Copy Room ID"
//           >
//             <FaCopy className="mr-2" />
//             Copy Room ID
//           </button>

//           {/* Connected Users */}
//           <h2 className="text-2xl font-semibold mb-4">Connected Users</h2>
//           <ul>
//             {clients.map((client) => (
//               <li key={client.socketId} className="mb-4 flex items-center">
//                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                   <span className="text-xl font-bold uppercase">
//                     {client.username.charAt(0)}
//                   </span>
//                 </div>
//                 <span className="ml-3">{client.username}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Leave Room Button */}
//         <button
//           onClick={() => navigate('/')}
//           className="w-full py-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
//         >
//           Leave Room
//         </button>
//       </aside>
//       <main ref={editorRef} className="flex-1 bg-gray-800">
//         <Editor
//           socketRef={socketRef}
//           roomId={roomId}
//           onCodeChange={(code) => {
//             codeRef.current = code;
//           }}
//           codeRef={codeRef} // Pass codeRef as a prop
//         />
//       </main>
//     </div>
//   );
// };

// export default EditorPage;




















































import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import ACTIONS from '../Actions';
import Editor from '../components/Editor';
import toast, { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';
import { FaCopy, FaBars } from 'react-icons/fa'; // Import copy and bars (menu) icon for toggle button
import './EditorPage.css'; // Link EditorPage-specific CSS

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const editorRef = useRef(null);
  const asideRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false); // Toggle sidebar visibility

  useEffect(() => {
    gsap.from(editorRef.current, {
      opacity: 0,
      duration: 1,
      x: 100,
      ease: 'power3.out',
    });
    gsap.from(asideRef.current, {
      opacity: 0,
      duration: 1,
      x: -100,
      ease: 'power3.out',
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      socketRef.current = io('http://localhost:5000'); // Adjust if using a different host

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.error('Socket error:', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for code synchronization
      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
        if (codeRef.current === '') {
          codeRef.current = code;
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
        }
      });

      // Listening for code changes from other clients
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        codeRef.current = code;
      });

      // Listening for disconnected users
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast(`${username} left the room.`, {
          icon: '👋',
        });
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.SYNC_CODE);
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [navigate, roomId, location.state]);

  if (!location.state) {
    navigate('/');
    return null;
  }

  // Function to copy Room ID to clipboard
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy Room ID.');
    }
  };

  return (
    <div className="flex h-screen">
      <Toaster position="top-right" />
      
      {/* Toggle Button for Mobile */}
      <button
        className="md:hidden text-white p-4 bg-gray-800"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        ref={asideRef}
        className={`sidebar transition-all duration-300 ${
          showSidebar ? 'block' : 'hidden'
        } md:block`}
      >
        {/* Top Section: Copy Room ID Button */}
        <div>
          <button
            onClick={copyRoomId}
            className="flex items-center bg-gray-700 hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded mb-6"
            title="Copy Room ID"
          >
            <FaCopy className="mr-2" />
            Copy Room ID
          </button>

          {/* Connected Users */}
          <h2 className="text-2xl font-semibold mb-4">Connected Users</h2>
          <ul>
            {clients.map((client) => (
              <li key={client.socketId} className="mb-4 flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold uppercase">
                    {client.username.charAt(0)}
                  </span>
                </div>
                <span className="ml-3">{client.username}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Leave Room Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
        >
          Leave Room
        </button>
      </aside>

      {/* Main Editor Area */}
      <main ref={editorRef} className="flex-1 bg-gray-800">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
          codeRef={codeRef}
        />
      </main>
    </div>
  );
};

export default EditorPage;
