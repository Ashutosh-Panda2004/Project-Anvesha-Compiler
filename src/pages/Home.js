// // src/components/Home.js

// import React, { useState, useEffect, useRef } from 'react';
// import { v4 as uuidV4 } from 'uuid';
// import { useNavigate } from 'react-router-dom';
// import { gsap } from 'gsap';
// import { TextPlugin } from 'gsap/TextPlugin';
// import toast, { Toaster } from 'react-hot-toast';

// gsap.registerPlugin(TextPlugin);

// const Button = ({ children, onClick, className = '', variant = 'primary', disabled }) => {
//   const baseClass = "px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105";
//   const variantClass = variant === 'primary' 
//     ? "bg-emerald-600 text-white hover:bg-emerald-700" 
//     : "bg-gray-800 text-emerald-400 hover:bg-gray-700";
  
//   return (
//     <button
//       onClick={onClick}
//       className={`${baseClass} ${variantClass} ${className}`}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// };

// const AnimatedText = ({ text }) => {
//   const textRef = useRef(null);

//   useEffect(() => {
//     gsap.to(textRef.current, {
//       duration: 2,
//       text: text,
//       ease: "power2.inOut",
//     });
//   }, [text]);

//   return <span ref={textRef}></span>;
// };

// const Home = () => {
//   const navigate = useNavigate();
//   const [roomId, setRoomId] = useState('');
//   const [username, setUsername] = useState('');
//   const [selectedLanguage, setSelectedLanguage] = useState('63'); // Default to JavaScript (language_id = 63)
//   const homeRef = useRef(null);
//   const formRef = useRef(null);
//   const [isCreatingRoom, setIsCreatingRoom] = useState(false);

//   // Define language options
//   const languageOptions = [
//     { id: '50', name: 'C' },
//     { id: '54', name: 'C++' },
//     { id: '62', name: 'Java' },
//     { id: '71', name: 'Python' },
//     { id: '63', name: 'JavaScript' },
//     // Add more languages as needed
//   ];

//   useEffect(() => {
//     const tl = gsap.timeline();

//     tl.from(homeRef.current, {
//       opacity: 0,
//       duration: 1,
//       ease: 'power3.out',
//     })
//     .from('.animate-in', {
//       y: 50,
//       opacity: 0,
//       stagger: 0.2,
//       duration: 0.8,
//       ease: 'back.out(1.7)',
//     })
//     .from('.floating-icon', {
//       y: -20,
//       rotation: -10,
//       duration: 2,
//       ease: 'power1.inOut',
//       repeat: -1,
//       yoyo: true,
//     }, '-=1');
//   }, []);

//   const createNewRoom = (e) => {
//     e.preventDefault();

//     // Validation: Ensure Username and Language are filled
//     if (!username.trim()) {
//       toast.error('Username is required to create a new room!');
//       return;
//     }

//     if (!selectedLanguage) {
//       toast.error('Please select a programming language!');
//       return;
//     }

//     const id = uuidV4();
//     setIsCreatingRoom(true);
    
//     gsap.to(formRef.current, {
//       backgroundColor: '#065f46',
//       duration: 0.5,
//       ease: 'power2.inOut',
//       onComplete: () => {
//         gsap.to(formRef.current, {
//           backgroundColor: '#1f2937',
//           duration: 0.5,
//           delay: 1,
//           ease: 'power2.inOut',
//         });
//       }
//     });

//     gsap.from('.form-element', {
//       y: 20,
//       opacity: 1,
//       stagger: 0.1,
//       duration: 0.5,
//       ease: 'back.out(1.7)',
//     });

//     toast.success('Created a new room!');
//     setTimeout(() => setIsCreatingRoom(false), 1500);

//     // Navigate to the editor with roomId and selectedLanguage
//     navigate(`/editor/${id}`, { state: { username, language: selectedLanguage } });
//   };

//   const joinRoom = () => {
//     // Validation: Ensure Room ID and Username are filled
//     if (!roomId.trim()) {
//       toast.error('Room ID is required to join a room!');
//       return;
//     }

//     if (!username.trim()) {
//       toast.error('Username is required to join a room!');
//       return;
//     }

//     // Navigate to the editor with roomId and selectedLanguage
//     navigate(`/editor/${roomId}`, { state: { username, language: selectedLanguage } });
//   };

//   const handleInputEnter = (e) => {
//     if (e.code === 'Enter') {
//       joinRoom();
//     }
//   };

//   return (
//     <div ref={homeRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
//       <Toaster position="top-right" />
//       <div className="container mx-auto px-4 py-12 relative">
//         <div className="text-emerald-400 absolute top-10 right-10 floating-icon text-4xl">🖥️</div>
//         <h1 className="text-7xl font-extrabold mb-8 animate-in text-emerald-400">
//           <AnimatedText text="Anvesha" />
//         </h1>
//         <p className="text-2xl mb-12 animate-in text-gray-300">Collaborate in real-time, create without limits.</p>
        
//         <div ref={formRef} className="bg-gray-800 rounded-lg p-8 shadow-2xl animate-in">
//           <div className="space-y-6">
//             {/* Room ID Input (Only for Joining a Room) */}
//             <input
//               type="text"
//               placeholder="Room ID"
//               className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 form-element"
//               onChange={(e) => setRoomId(e.target.value)}
//               value={roomId}
//               onKeyUp={handleInputEnter}
//             />
//             {/* Username Input */}
//             <input
//               type="text"
//               placeholder="Username"
//               className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 form-element"
//               onChange={(e) => setUsername(e.target.value)}
//               value={username}
//               onKeyUp={handleInputEnter}
//             />
//             {/* Language Selection Dropdown */}
//             <select
//               className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 form-element"
//               value={selectedLanguage}
//               onChange={(e) => setSelectedLanguage(e.target.value)}
//             >
//               <option value="" disabled>Select Language</option>
//               {languageOptions.map((lang) => (
//                 <option key={lang.id} value={lang.id}>
//                   {lang.name}
//                 </option>
//               ))}
//             </select>
//             <div className="flex gap-4">
//               <Button onClick={joinRoom} className="w-1/2 form-element">
//                 Join Room
//               </Button>
//               <Button onClick={createNewRoom} variant="secondary" className="w-1/2 form-element" disabled={isCreatingRoom}>
//                 {isCreatingRoom ? 'Creating...' : 'Create New Room'}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;



















































import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import toast, { Toaster } from 'react-hot-toast';

gsap.registerPlugin(TextPlugin);

const Button = ({ children, onClick, className = '', variant = 'primary', disabled }) => {
  const baseClass = "px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105";
  const variantClass = variant === 'primary' 
    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
    : "bg-gray-800 text-emerald-400 hover:bg-gray-700";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const AnimatedText = ({ text }) => {
  const textRef = useRef(null);

  useEffect(() => {
    gsap.to(textRef.current, {
      duration: 2,
      text: text,
      ease: "power2.inOut",
    });
  }, [text]);

  return <span ref={textRef}></span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('63'); // Default to JavaScript (language_id = 63)
  const homeRef = useRef(null);
  const formRef = useRef(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const languageOptions = [
    { id: '50', name: 'C' },
    { id: '54', name: 'C++' },
    { id: '62', name: 'Java' },
    { id: '71', name: 'Python' },
    { id: '63', name: 'JavaScript' },
  ];

  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(homeRef.current, {
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    })
    .from('.animate-in', {
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: 'back.out(1.7)',
    })
    .from('.floating-icon', {
      y: -20,
      rotation: -10,
      duration: 2,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    }, '-=1');
  }, []);

  const createNewRoom = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Username is required to create a new room!');
      return;
    }

    if (!selectedLanguage) {
      toast.error('Please select a programming language!');
      return;
    }

    const id = uuidV4();
    setIsCreatingRoom(true);
    
    gsap.to(formRef.current, {
      backgroundColor: '#065f46',
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(formRef.current, {
          backgroundColor: '#1f2937',
          duration: 0.5,
          delay: 1,
          ease: 'power2.inOut',
        });
      }
    });

    gsap.from('.form-element', {
      y: 20,
      opacity: 1,
      stagger: 0.1,
      duration: 0.5,
      ease: 'back.out(1.7)',
    });

    toast.success('Created a new room!');
    setTimeout(() => setIsCreatingRoom(false), 1500);

    navigate(`/editor/${id}`, { state: { username, language: selectedLanguage } });
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      toast.error('Room ID is required to join a room!');
      return;
    }

    if (!username.trim()) {
      toast.error('Username is required to join a room!');
      return;
    }

    navigate(`/editor/${roomId}`, { state: { username, language: selectedLanguage } });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    setShowWarning(true);
  };

  return (
    <div ref={homeRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="text-emerald-400 absolute top-10 right-10 floating-icon text-4xl">🖥️</div>
        <h1 className="text-7xl font-extrabold mb-8 animate-in text-emerald-400">
          <AnimatedText text="Anvesha" />
        </h1>
        <p className="text-2xl mb-12 animate-in text-gray-300">Collaborate in real-time, create without limits.</p>
        
        <div ref={formRef} className="bg-gray-800 rounded-lg p-8 shadow-2xl animate-in">
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Room ID"
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 form-element"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 form-element"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
            <div className="relative">
              <select
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 form-element"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value="" disabled>Select the same language as the host.</option>
                {languageOptions.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              {showWarning && (
                <p className="text-yellow-400 text-sm mt-2">
                  {roomId ? "Select the same language as the host." : "Creating a new room? Select the language you want in your Compiler."}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={joinRoom} className="w-1/2 form-element">
                Join Room
              </Button>
              <Button onClick={createNewRoom} variant="secondary" className="w-1/2 form-element" disabled={isCreatingRoom}>
                {isCreatingRoom ? 'Creating...' : 'Create New Room'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;