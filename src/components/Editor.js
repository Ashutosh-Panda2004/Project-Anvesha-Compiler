// // src/components/Editor.js

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css'; // Main CodeMirror CSS
// import { saveAs } from 'file-saver'; // Library to save files

// // Importing desired CodeMirror themes
// import 'codemirror/theme/eclipse.css';         // Eclipse Theme
// import 'codemirror/theme/solarized.css';      // Solarized Light Theme
// import 'codemirror/theme/monokai.css';        // Monokai Theme
// import 'codemirror/theme/material.css';       // Material Light Theme
// import 'codemirror/theme/dracula.css';        // Dracula Theme

// // Importing CodeMirror modes
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/mode/clike/clike';

// // Importing CodeMirror addons
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';

// // Importing necessary libraries and utilities
// import ACTIONS from '../Actions';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import debounce from 'lodash.debounce'; // Import debounce

// const Editor = ({ socketRef, roomId, onCodeChange }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const [language, setLanguage] = useState('63'); // Default to JavaScript (language_id = 63)
//   const [output, setOutput] = useState('');
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem('preferred-theme') || 'eclipse';
//   }); // Default theme
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false); // Dropdown state
//   const [isSavePopupOpen, setIsSavePopupOpen] = useState(false); // State for save popup
//   const [fileName, setFileName] = useState('');
//   const [authorName, setAuthorName] = useState('');

//   // Define language options with C, C++, Java, Python, and JavaScript included
//   const languageOptions = [
//     { id: 50, name: 'C', mode: 'text/x-csrc', ext: 'c' },
//     { id: 54, name: 'C++', mode: 'text/x-c++src', ext: 'cpp' },
//     { id: 62, name: 'Java', mode: 'text/x-java', ext: 'java' },
//     { id: 71, name: 'Python', mode: 'python', ext: 'py' },
//     { id: 63, name: 'JavaScript', mode: 'javascript', ext: 'js' },
//     // Add more languages as needed
//   ];

//   // Define theme options
//   const themeOptions = [
//     { name: 'Eclipse', value: 'eclipse' },
//     { name: 'Solarized Light', value: 'solarized light' },
//     { name: 'Monokai', value: 'monokai' },
//     { name: 'Material Light', value: 'material' },
//     { name: 'Dracula', value: 'dracula' },
//     // Add more themes as needed
//   ];

//   // Define template codes for C, C++, Java, Python, and JavaScript
//   const codeTemplates = {
//     50: `#include <stdio.h>

// int main() {
//     printf("Hello, World!\\n");
//     return 0;
// }`,
//     54: `#include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello, World!" << endl;
//     return 0;
// }`,
//     62: `public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello, World!");
//     }
// }`,
//     71: `print('Hello World');`,
//     63: `console.log('Hello World');`,
//   };

//   // Map language ID to file extension
//   const getFileExtension = (langId) => {
//     const lang = languageOptions.find((l) => l.id === parseInt(langId));
//     switch (lang?.name) {
//       case 'C':
//         return 'c';
//       case 'C++':
//         return 'cpp';
//       case 'Java':
//         return 'java';
//       case 'Python':
//         return 'py';
//       case 'JavaScript':
//         return 'js';
//       default:
//         return 'txt';
//     }
//   };

//   // Initialize CodeMirror and handle code changes
//   useEffect(() => {
//     editorRef.current = Codemirror.fromTextArea(
//       document.getElementById('realtimeEditor'),
//       {
//         mode:
//           languageOptions.find((lang) => lang.id === parseInt(language))?.mode ||
//           'javascript', // Dynamic mode based on selected language
//         theme: theme === 'default' ? 'default' : theme, // Set theme
//         lineNumbers: true,
//         autoCloseBrackets: true,
//         autoCloseTags: true,
//         tabSize: 2,
//         indentUnit: 2,
//       }
//     );

//     if (codeTemplates[language]) {
//       editorRef.current.setValue(codeTemplates[language]);
//       onCodeChange(codeTemplates[language]);
//     }

//     const emitCodeChange = debounce((code) => {
//       if (socketRef.current) {
//         socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//       } else {
//         console.warn('Socket is not connected. Cannot emit CODE_CHANGE.');
//       }
//     }, 300); // 300ms debounce delay

//     editorRef.current.on('change', (instance, changes) => {
//       const { origin } = changes;
//       const code = instance.getValue();
//       onCodeChange(code);

//       if (origin !== 'setValue') {
//         emitCodeChange(code);
//       }
//     });

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//       }
//       emitCodeChange.cancel();
//     };
//   }, [socketRef, roomId, onCodeChange, language, theme]);

//   // Handle incoming code changes from other clients
//   useEffect(() => {
//     // Handler for receiving code changes from other clients
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         editorRef.current.setValue(code);
//       }
//     };

//     // Attach the CODE_CHANGE event listener
//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     // Cleanup the event listener on component unmount or when socketRef changes
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef]);

//   // Update the editor mode and load template code when the language changes
//   useEffect(() => {
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === parseInt(language)
//     );
//     if (selectedLanguage && editorRef.current) {
//       editorRef.current.setOption('mode', selectedLanguage.mode);
//       // Load template code if available for the selected language
//       if (codeTemplates[selectedLanguage.id]) {
//         editorRef.current.setValue(codeTemplates[selectedLanguage.id]);
//         onCodeChange(codeTemplates[selectedLanguage.id]);
//         // Emit the code change to synchronize with other clients
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//             roomId,
//             code: codeTemplates[selectedLanguage.id],
//           });
//         }
//       } else {
//         // If no template, clear the editor
//         editorRef.current.setValue('');
//         onCodeChange('');
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//             roomId,
//             code: '',
//           });
//         }
//       }
//     }
//   }, [language, languageOptions, codeTemplates, socketRef, roomId, onCodeChange]);

//   // Persist theme preference in localStorage
//   useEffect(() => {
//     localStorage.setItem('preferred-theme', theme);
//   }, [theme]);

//   // Update the editor theme when the 'theme' state changes
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption('theme', theme === 'default' ? 'default' : theme);
//     }
//   }, [theme]);

//   // Handle compilation of the code
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));
//     if (!selectedLanguage) {
//       toast.error('Selected language is not supported.');
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput('Running...');

//       const response = await axios.post('/api/compile', {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: '', // You can modify this if you want to support stdin
//       });

//       const result = response.data;

//       // Decode base64-encoded responses if necessary
//       const output = atob(result.stdout || '');
//       const stderr = atob(result.stderr || '');
//       const compile_output = atob(result.compile_output || '');
//       const status = result.status;

//       if (status.id !== 3) {
//         // Non-success status
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//       console.error('Run Error:', error);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   // Handle saving the file
//   const handleSave = () => {
//     setIsSavePopupOpen(true);
//   };

//   const downloadFile = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));

//     if (!fileName.trim() || !authorName.trim()) {
//       toast.error('Please provide both file name and author name.');
//       return;
//     }

//     const extension = getFileExtension(language);
//     const sanitizedFileName = fileName.trim().replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize file name
//     const sanitizedAuthorName = authorName.trim().replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize author name
//     const fileWithExtension = `${sanitizedFileName}_${sanitizedAuthorName}.${extension}`;

//     // Add author comment based on language
//     let authorComment = '';
//     switch (language) {
//       case '50': // C
//       case '54': // C++
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       case '62': // Java
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       case '71': // Python
//         authorComment = `# Author: ${authorName.trim()}\n\n`;
//         break;
//       case '63': // JavaScript
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       default:
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//     }

//     const finalContent = authorComment + sourceCode;

//     const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, fileWithExtension);
//     setIsSavePopupOpen(false);
//     toast.success(`File saved as ${fileWithExtension}`);
//   };

//   return (
//     <div ref={editorContainerRef} className="h-full flex flex-col bg-slate-950">
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Selector */}
//         <select
//           className="p-2 bg-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//         >
//           {languageOptions.map((lang) => (
//             <option key={lang.id} value={lang.id}>
//               {lang.name}
//             </option>
//           ))}
//         </select>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? 'font-semibold' : ''
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Save Button */}
//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300 shadow"
//         >
//           Save
//         </button>

//         {/* Run Button */}
//         <button
//           onClick={handleRun}
//           disabled={isCompiling}
//           className={`ml-4 px-4 py-2 ${
//             isCompiling ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
//           } text-white rounded transition duration-300 shadow`}
//         >
//           {isCompiling ? 'Running...' : 'Run'}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Save Popup */}
//       {isSavePopupOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
//           <div className="bg-blue-950 p-6 rounded shadow-lg">
//             <h2 className="text-lg font-semibold mb-4">Save File</h2>
//             <label className="block mb-2">
//               File Name:
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full mt-1"
//                 value={fileName}
//                 onChange={(e) => setFileName(e.target.value)}
//                 placeholder="Enter file name"
//               />
//             </label>
//             <label className="block mb-4">
//               Author Name:
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full mt-1"
//                 value={authorName}
//                 onChange={(e) => setAuthorName(e.target.value)}
//                 placeholder="Enter your name"
//               />
//             </label>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={downloadFile}
//                 className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setIsSavePopupOpen(false)}
//                 className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Output Section */}
//       <div
//         className={`p-4 overflow-y-auto ${
//           theme === 'monokai' || theme === 'dracula' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
//         }`}
//         style={{ height: '200px' }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;

// // src/components/Editor.js

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css'; // Main CodeMirror CSS
// import { saveAs } from 'file-saver'; // Library to save files

// // Importing desired CodeMirror themes
// import 'codemirror/theme/eclipse.css';         // Eclipse Theme
// import 'codemirror/theme/solarized.css';      // Solarized Light Theme
// import 'codemirror/theme/monokai.css';        // Monokai Theme
// import 'codemirror/theme/material.css';       // Material Light Theme
// import 'codemirror/theme/dracula.css';        // Dracula Theme

// // Importing CodeMirror modes
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/mode/clike/clike';

// // Importing CodeMirror addons
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';

// // Importing necessary libraries and utilities
// import ACTIONS from '../Actions';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import debounce from 'lodash.debounce'; // Import debounce

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const [language, setLanguage] = useState('63'); // Default to JavaScript (language_id = 63)
//   const [output, setOutput] = useState('');
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem('preferred-theme') || 'eclipse';
//   }); // Default theme
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false); // Dropdown state
//   const [isSavePopupOpen, setIsSavePopupOpen] = useState(false); // State for save popup
//   const [fileName, setFileName] = useState('');
//   const [authorName, setAuthorName] = useState('');

//   // Define language options with C, C++, Java, Python, and JavaScript included
//   const languageOptions = [
//     { id: 50, name: 'C', mode: 'text/x-csrc', ext: 'c' },
//     { id: 54, name: 'C++', mode: 'text/x-c++src', ext: 'cpp' },
//     { id: 62, name: 'Java', mode: 'text/x-java', ext: 'java' },
//     { id: 71, name: 'Python', mode: 'python', ext: 'py' },
//     { id: 63, name: 'JavaScript', mode: 'javascript', ext: 'js' },
//     // Add more languages as needed
//   ];

//   // Define theme options
//   const themeOptions = [
//     { name: 'Eclipse', value: 'eclipse' },
//     { name: 'Solarized Light', value: 'solarized light' },
//     { name: 'Monokai', value: 'monokai' },
//     { name: 'Material Light', value: 'material' },
//     { name: 'Dracula', value: 'dracula' },
//     // Add more themes as needed
//   ];

//   // Define template codes for C, C++, Java, Python, and JavaScript
//   const codeTemplates = {
//     50: `#include <stdio.h>

// int main() {
//     printf("Hello, World!\\n");
//     return 0;
// }`,
//     54: `#include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello, World!" << endl;
//     return 0;
// }`,
//     62: `public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello, World!");
//     }
// }`,
//     71: `print('Hello World');`,
//     63: `console.log('Hello World');`,
//   };

//   // Map language ID to file extension
//   const getFileExtension = (langId) => {
//     const lang = languageOptions.find((l) => l.id === parseInt(langId));
//     switch (lang?.name) {
//       case 'C':
//         return 'c';
//       case 'C++':
//         return 'cpp';
//       case 'Java':
//         return 'java';
//       case 'Python':
//         return 'py';
//       case 'JavaScript':
//         return 'js';
//       default:
//         return 'txt';
//     }
//   };

//   // Initialize CodeMirror and handle code changes
//   useEffect(() => {
//     editorRef.current = Codemirror.fromTextArea(
//       document.getElementById('realtimeEditor'),
//       {
//         mode:
//           languageOptions.find((lang) => lang.id === parseInt(language))?.mode ||
//           'javascript', // Dynamic mode based on selected language
//         theme: theme === 'default' ? 'default' : theme, // Set theme
//         lineNumbers: true,
//         autoCloseBrackets: true,
//         autoCloseTags: true,
//         tabSize: 2,
//         indentUnit: 2,
//       }
//     );

//     // Only set the template if there's no existing code
//     if (!codeRef.current) {
//       if (codeTemplates[language]) {
//         editorRef.current.setValue(codeTemplates[language]);
//         onCodeChange(codeTemplates[language]);
//         codeRef.current = codeTemplates[language]; // Update codeRef
//       }
//     } else {
//       editorRef.current.setValue(codeRef.current);
//     }

//     const emitCodeChange = debounce((code) => {
//       if (socketRef.current) {
//         socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//       } else {
//         console.warn('Socket is not connected. Cannot emit CODE_CHANGE.');
//       }
//     }, 300); // 300ms debounce delay

//     editorRef.current.on('change', (instance, changes) => {
//       const { origin } = changes;
//       const code = instance.getValue();
//       onCodeChange(code);

//       if (origin !== 'setValue') {
//         emitCodeChange(code);
//       }
//     });

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//       }
//       emitCodeChange.cancel();
//     };
//   }, [socketRef, roomId, onCodeChange, language, theme, codeTemplates, codeRef]);

//   // Handle incoming code changes from other clients
//   useEffect(() => {
//     // Handler for receiving code changes from other clients
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         editorRef.current.setValue(code);
//         codeRef.current = code; // Update codeRef
//       }
//     };

//     // Attach the CODE_CHANGE event listener
//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     // Cleanup the event listener on component unmount or when socketRef changes
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef, codeRef]);

//   // Update the editor mode and load template code when the language changes
//   useEffect(() => {
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === parseInt(language)
//     );
//     if (selectedLanguage && editorRef.current) {
//       editorRef.current.setOption('mode', selectedLanguage.mode);

//       // Only set template if current code is the template or empty
//       const currentCode = editorRef.current.getValue();
//       const isTemplate = Object.values(codeTemplates).includes(currentCode) || currentCode.trim() === '';
//       if (isTemplate && codeTemplates[selectedLanguage.id]) {
//         editorRef.current.setValue(codeTemplates[selectedLanguage.id]);
//         onCodeChange(codeTemplates[selectedLanguage.id]);
//         codeRef.current = codeTemplates[selectedLanguage.id]; // Update codeRef
//         // Emit the code change to synchronize with other clients
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//             roomId,
//             code: codeTemplates[selectedLanguage.id],
//           });
//         }
//       }
//     }
//   }, [language, languageOptions, codeTemplates, socketRef, roomId, onCodeChange, codeRef]);

//   // Persist theme preference in localStorage
//   useEffect(() => {
//     localStorage.setItem('preferred-theme', theme);
//   }, [theme]);

//   // Update the editor theme when the 'theme' state changes
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption('theme', theme === 'default' ? 'default' : theme);
//     }
//   }, [theme]);

//   // Handle compilation of the code
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));
//     if (!selectedLanguage) {
//       toast.error('Selected language is not supported.');
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput('Running...');

//       const response = await axios.post('/api/compile', {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: '', // You can modify this if you want to support stdin
//       });

//       const result = response.data;

//       // Decode base64-encoded responses if necessary
//       const output = atob(result.stdout || '');
//       const stderr = atob(result.stderr || '');
//       const compile_output = atob(result.compile_output || '');
//       const status = result.status;

//       if (status.id !== 3) {
//         // Non-success status
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//       console.error('Run Error:', error);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   // Handle saving the file
//   const handleSave = () => {
//     setIsSavePopupOpen(true);
//   };

//   const downloadFile = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));

//     if (!fileName.trim() || !authorName.trim()) {
//       toast.error('Please provide both file name and author name.');
//       return;
//     }

//     const extension = getFileExtension(language);
//     const sanitizedFileName = fileName.trim().replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize file name
//     const sanitizedAuthorName = authorName.trim().replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize author name
//     const fileWithExtension = `${sanitizedFileName}_${sanitizedAuthorName}.${extension}`;

//     // Add author comment based on language
//     let authorComment = '';
//     switch (language) {
//       case '50': // C
//       case '54': // C++
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       case '62': // Java
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       case '71': // Python
//         authorComment = `# Author: ${authorName.trim()}\n\n`;
//         break;
//       case '63': // JavaScript
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       default:
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//     }

//     const finalContent = authorComment + sourceCode;

//     const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, fileWithExtension);
//     setIsSavePopupOpen(false);
//     toast.success(`File saved as ${fileWithExtension}`);
//   };

//   return (
//     <div ref={editorContainerRef} className="h-full flex flex-col bg-slate-950">
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Selector */}
//         <select
//           className="p-2 bg-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//         >
//           {languageOptions.map((lang) => (
//             <option key={lang.id} value={lang.id}>
//               {lang.name}
//             </option>
//           ))}
//         </select>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? 'font-semibold' : ''
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Save Button */}
//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300 shadow"
//         >
//           Save
//         </button>

//         {/* Run Button */}
//         <button
//           onClick={handleRun}
//           disabled={isCompiling}
//           className={`ml-4 px-4 py-2 ${
//             isCompiling ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
//           } text-white rounded transition duration-300 shadow`}
//         >
//           {isCompiling ? 'Running...' : 'Run'}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Save Popup */}
//       {isSavePopupOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
//           <div className="bg-blue-950 p-6 rounded shadow-lg">
//             <h2 className="text-lg font-semibold mb-4">Save File</h2>
//             <label className="block mb-2">
//               File Name:
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full mt-1"
//                 value={fileName}
//                 onChange={(e) => setFileName(e.target.value)}
//                 placeholder="Enter file name"
//               />
//             </label>
//             <label className="block mb-4">
//               Author Name:
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full mt-1"
//                 value={authorName}
//                 onChange={(e) => setAuthorName(e.target.value)}
//                 placeholder="Enter your name"
//               />
//             </label>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={downloadFile}
//                 className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setIsSavePopupOpen(false)}
//                 className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Output Section */}
//       <div
//         className={`p-4 overflow-y-auto ${
//           theme === 'monokai' || theme === 'dracula' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
//         }`}
//         style={{ height: '200px' }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;

// // src/components/Editor.js

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css'; // Main CodeMirror CSS
// import { saveAs } from 'file-saver'; // Library to save files

// // Importing desired CodeMirror themes
// import 'codemirror/theme/eclipse.css';         // Eclipse Theme
// import 'codemirror/theme/solarized.css';      // Solarized Light Theme
// import 'codemirror/theme/monokai.css';        // Monokai Theme
// import 'codemirror/theme/material.css';       // Material Light Theme
// import 'codemirror/theme/dracula.css';        // Dracula Theme

// // Importing CodeMirror modes
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/mode/clike/clike';

// // Importing CodeMirror addons
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';

// // Importing necessary libraries and utilities
// import ACTIONS from '../Actions';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import debounce from 'lodash.debounce'; // Import debounce

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const [language, setLanguage] = useState('63'); // Default to JavaScript (language_id = 63)
//   const [output, setOutput] = useState('');
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem('preferred-theme') || 'eclipse';
//   }); // Default theme
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false); // Dropdown state
//   const [isSavePopupOpen, setIsSavePopupOpen] = useState(false); // State for save popup
//   const [fileName, setFileName] = useState('');
//   const [authorName, setAuthorName] = useState('');

//   // Define language options with C, C++, Java, Python, and JavaScript included
//   const languageOptions = [
//     { id: 50, name: 'C', mode: 'text/x-csrc', ext: 'c' },
//     { id: 54, name: 'C++', mode: 'text/x-c++src', ext: 'cpp' },
//     { id: 62, name: 'Java', mode: 'text/x-java', ext: 'java' },
//     { id: 71, name: 'Python', mode: 'python', ext: 'py' },
//     { id: 63, name: 'JavaScript', mode: 'javascript', ext: 'js' },
//     // Add more languages as needed
//   ];

//   // Define theme options
//   const themeOptions = [
//     { name: 'Eclipse', value: 'eclipse' },
//     { name: 'Solarized Light', value: 'solarized light' },
//     { name: 'Monokai', value: 'monokai' },
//     { name: 'Material Light', value: 'material' },
//     { name: 'Dracula', value: 'dracula' },
//     // Add more themes as needed
//   ];

//   // Define template codes for C, C++, Java, Python, and JavaScript
//   const codeTemplates = {
//     50: `#include <stdio.h>

// int main() {
//     printf("Hello, World!\\n");
//     return 0;
// }`,
//     54: `#include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello, World!" << endl;
//     return 0;
// }`,
//     62: `public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello, World!");
//     }
// }`,
//     71: `print('Hello World');`,
//     63: `console.log('Hello World');`,
//   };

//   // Map language ID to file extension
//   const getFileExtension = (langId) => {
//     const lang = languageOptions.find((l) => l.id === parseInt(langId));
//     switch (lang?.name) {
//       case 'C':
//         return 'c';
//       case 'C++':
//         return 'cpp';
//       case 'Java':
//         return 'java';
//       case 'Python':
//         return 'py';
//       case 'JavaScript':
//         return 'js';
//       default:
//         return 'txt';
//     }
//   };

//   // Initialize CodeMirror and handle code changes
//   useEffect(() => {
//     editorRef.current = Codemirror.fromTextArea(
//       document.getElementById('realtimeEditor'),
//       {
//         mode:
//           languageOptions.find((lang) => lang.id === parseInt(language))?.mode ||
//           'javascript', // Dynamic mode based on selected language
//         theme: theme === 'default' ? 'default' : theme, // Set theme
//         lineNumbers: true,
//         autoCloseBrackets: true,
//         autoCloseTags: true,
//         tabSize: 2,
//         indentUnit: 2,
//       }
//     );

//     // Only set the template if there's no existing code
//     if (!codeRef.current) {
//       if (codeTemplates[language]) {
//         editorRef.current.setValue(codeTemplates[language]);
//         onCodeChange(codeTemplates[language]);
//         codeRef.current = codeTemplates[language]; // Update codeRef
//       }
//     } else {
//       editorRef.current.setValue(codeRef.current);
//     }

//     const emitCodeChange = debounce((code) => {
//       if (socketRef.current) {
//         socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//       } else {
//         console.warn('Socket is not connected. Cannot emit CODE_CHANGE.');
//       }
//     }, 300); // 300ms debounce delay

//     editorRef.current.on('change', (instance, changes) => {
//       const { origin } = changes;
//       const code = instance.getValue();
//       onCodeChange(code);

//       if (origin !== 'setValue') {
//         emitCodeChange(code);
//       }
//     });

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//       }
//       emitCodeChange.cancel();
//     };
//   }, [socketRef, roomId, onCodeChange, language, theme, codeTemplates, codeRef]);

//   // Handle incoming code changes from other clients
//   useEffect(() => {
//     // Handler for receiving code changes from other clients
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         editorRef.current.setValue(code);
//         codeRef.current = code; // Update codeRef
//       }
//     };

//     // Attach the CODE_CHANGE event listener
//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     // Cleanup the event listener on component unmount or when socketRef changes
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef, codeRef]);

//   // Update the editor mode and load template code when the language changes
//   useEffect(() => {
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === parseInt(language)
//     );
//     if (selectedLanguage && editorRef.current) {
//       editorRef.current.setOption('mode', selectedLanguage.mode);

//       // Only set template if current code is the template or empty
//       const currentCode = editorRef.current.getValue();
//       const isTemplate = Object.values(codeTemplates).includes(currentCode) || currentCode.trim() === '';
//       if (isTemplate && codeTemplates[selectedLanguage.id]) {
//         editorRef.current.setValue(codeTemplates[selectedLanguage.id]);
//         onCodeChange(codeTemplates[selectedLanguage.id]);
//         codeRef.current = codeTemplates[selectedLanguage.id]; // Update codeRef
//         // Emit the code change to synchronize with other clients
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//             roomId,
//             code: codeTemplates[selectedLanguage.id],
//           });
//         }
//       }
//     }
//   }, [language, languageOptions, codeTemplates, socketRef, roomId, onCodeChange, codeRef]);

//   // Persist theme preference in localStorage
//   useEffect(() => {
//     localStorage.setItem('preferred-theme', theme);
//   }, [theme]);

//   // Update the editor theme when the 'theme' state changes
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption('theme', theme === 'default' ? 'default' : theme);
//     }
//   }, [theme]);

//   // Handle compilation of the code
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));
//     if (!selectedLanguage) {
//       toast.error('Selected language is not supported.');
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput('Running...');

//       const response = await axios.post('/api/compile', {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: '', // You can modify this if you want to support stdin
//       });

//       const result = response.data;

//       // Decode base64-encoded responses if necessary
//       const output = atob(result.stdout || '');
//       const stderr = atob(result.stderr || '');
//       const compile_output = atob(result.compile_output || '');
//       const status = result.status;

//       if (status.id !== 3) {
//         // Non-success status
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//       console.error('Run Error:', error);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   // Handle saving the file
//   const handleSave = () => {
//     setIsSavePopupOpen(true);
//   };

//   const downloadFile = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));

//     if (!fileName.trim() || !authorName.trim()) {
//       toast.error('Please provide both file name and author name.');
//       return;
//     }

//     const extension = getFileExtension(language);
//     const sanitizedFileName = fileName.trim().replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize file name
//     const sanitizedAuthorName = authorName.trim().replace(/[^a-z0-9_\-]/gi, '_'); // Sanitize author name
//     const fileWithExtension = `${sanitizedFileName}_${sanitizedAuthorName}.${extension}`;

//     // Add author comment based on language
//     let authorComment = '';
//     switch (language) {
//       case '50': // C
//       case '54': // C++
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       case '62': // Java
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       case '71': // Python
//         authorComment = `# Author: ${authorName.trim()}\n\n`;
//         break;
//       case '63': // JavaScript
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//       default:
//         authorComment = `// Author: ${authorName.trim()}\n\n`;
//         break;
//     }

//     const finalContent = authorComment + sourceCode;

//     const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, fileWithExtension);
//     setIsSavePopupOpen(false);
//     toast.success(`File saved as ${fileWithExtension}`);
//   };

//   return (
//     <div ref={editorContainerRef} className="h-full flex flex-col bg-slate-950">
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Selector */}
//         <select
//           className="p-2 bg-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//         >
//           {languageOptions.map((lang) => (
//             <option key={lang.id} value={lang.id}>
//               {lang.name}
//             </option>
//           ))}
//         </select>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? 'font-semibold' : ''
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Save Button */}
//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300 shadow"
//         >
//           Save
//         </button>

//         {/* Run Button */}
//         <button
//           onClick={handleRun}
//           disabled={isCompiling}
//           className={`ml-4 px-4 py-2 ${
//             isCompiling ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
//           } text-white rounded transition duration-300 shadow`}
//         >
//           {isCompiling ? 'Running...' : 'Run'}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Save Popup */}
//       {isSavePopupOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
//           <div className="bg-blue-950 p-6 rounded shadow-lg">
//             <h2 className="text-lg font-semibold mb-4">Save File</h2>
//             <label className="block mb-2">
//               File Name:
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full mt-1"
//                 value={fileName}
//                 onChange={(e) => setFileName(e.target.value)}
//                 placeholder="Enter file name"
//               />
//             </label>
//             <label className="block mb-4">
//               Author Name:
//               <input
//                 type="text"
//                 className="border border-gray-300 p-2 w-full mt-1"
//                 value={authorName}
//                 onChange={(e) => setAuthorName(e.target.value)}
//                 placeholder="Enter your name"
//               />
//             </label>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={downloadFile}
//                 className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setIsSavePopupOpen(false)}
//                 className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Output Section */}
//       <div
//         className={`p-4 overflow-y-auto ${
//           theme === 'monokai' || theme === 'dracula' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
//         }`}
//         style={{ height: '200px' }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css'; // Main CodeMirror CSS
// import { saveAs } from 'file-saver'; // Library to save files

// // Importing desired CodeMirror themes
// import 'codemirror/theme/eclipse.css';         // Eclipse Theme
// import 'codemirror/theme/solarized.css';      // Solarized Light Theme
// import 'codemirror/theme/monokai.css';        // Monokai Theme
// import 'codemirror/theme/material.css';       // Material Light Theme
// import 'codemirror/theme/dracula.css';        // Dracula Theme

// // Importing CodeMirror modes
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/mode/clike/clike';

// // Importing CodeMirror addons
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';

// import ACTIONS from '../Actions';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import debounce from 'lodash.debounce'; // Import debounce

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const [language, setLanguage] = useState('63'); // Default to JavaScript (language_id = 63)
//   const [output, setOutput] = useState('');
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem('preferred-theme') || 'eclipse';
//   }); // Default theme

//   // State to save code for each language
//   const [languageCodes, setLanguageCodes] = useState({
//     50: '', // C
//     54: '', // C++
//     62: '', // Java
//     71: '', // Python
//     63: '', // JavaScript
//   });

//   const languageOptions = [
//     { id: 50, name: 'C', mode: 'text/x-csrc', ext: 'c' },
//     { id: 54, name: 'C++', mode: 'text/x-c++src', ext: 'cpp' },
//     { id: 62, name: 'Java', mode: 'text/x-java', ext: 'java' },
//     { id: 71, name: 'Python', mode: 'python', ext: 'py' },
//     { id: 63, name: 'JavaScript', mode: 'javascript', ext: 'js' },
//   ];

//   const codeTemplates = {
//     50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//     54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
//     62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
//     71: `print('Hello World');`,
//     63: `console.log('Hello World');`,
//   };

//   // Function to update language code when switching languages
//   const handleLanguageSwitch = (newLanguageId) => {
//     const currentCode = editorRef.current.getValue();

//     // Save the current code in the state associated with the current language
//     setLanguageCodes((prevCodes) => ({
//       ...prevCodes,
//       [language]: currentCode, // Store current language code
//     }));

//     // Switch language
//     setLanguage(newLanguageId);

//     // Load the saved code or template for the new language
//     const newLanguageCode = languageCodes[newLanguageId] || codeTemplates[newLanguageId];

//     // Set the new language code in the editor
//     if (editorRef.current) {
//       editorRef.current.setValue(newLanguageCode);
//       onCodeChange(newLanguageCode);
//       codeRef.current = newLanguageCode; // Update the codeRef with the new code
//     }
//   };

//   // Initialize CodeMirror and handle code changes
//   useEffect(() => {
//     editorRef.current = Codemirror.fromTextArea(
//       document.getElementById('realtimeEditor'),
//       {
//         mode: languageOptions.find((lang) => lang.id === parseInt(language))?.mode || 'javascript',
//         theme: theme === 'default' ? 'default' : theme,
//         lineNumbers: true,
//         autoCloseBrackets: true,
//         autoCloseTags: true,
//         tabSize: 2,
//         indentUnit: 2,
//       }
//     );

//     const emitCodeChange = debounce((code) => {
//       if (socketRef.current) {
//         socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//       } else {
//         console.warn('Socket is not connected. Cannot emit CODE_CHANGE.');
//       }
//     }, 300); // 300ms debounce delay

//     editorRef.current.on('change', (instance, changes) => {
//       const { origin } = changes;
//       const code = instance.getValue();
//       onCodeChange(code);

//       if (origin !== 'setValue') {
//         emitCodeChange(code);
//       }
//     });

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//       }
//       emitCodeChange.cancel();
//     };
//   }, [socketRef, roomId, onCodeChange, language, theme]);

//   // Handle incoming code changes from other clients
//   useEffect(() => {
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         editorRef.current.setValue(code);
//         codeRef.current = code;
//       }
//     };

//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef, codeRef]);

//   // Load the appropriate code when the language is switched
//   useEffect(() => {
//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));
//     if (selectedLanguage && editorRef.current) {
//       editorRef.current.setOption('mode', selectedLanguage.mode);

//       const savedCode = languageCodes[language] || codeTemplates[language];
//       editorRef.current.setValue(savedCode);
//       onCodeChange(savedCode);
//       codeRef.current = savedCode;
//     }
//   }, [language, languageCodes, codeTemplates, socketRef, roomId, onCodeChange, codeRef]);

//   // Persist theme preference in localStorage
//   useEffect(() => {
//     localStorage.setItem('preferred-theme', theme);
//   }, [theme]);

//   // Update the editor theme when the 'theme' state changes
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption('theme', theme === 'default' ? 'default' : theme);
//     }
//   }, [theme]);

//   // Handle saving the file
//   const handleSave = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find((lang) => lang.id === parseInt(language));

//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     const blob = new Blob([sourceCode], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, `code.${selectedLanguage.ext}`);
//     toast.success(`File saved as code.${selectedLanguage.ext}`);
//   };

//   // Handle code compilation
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput('Running...');

//       const response = await axios.post('/api/compile', {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: '',
//       });

//       const result = response.data;
//       const output = atob(result.stdout || '');
//       const stderr = atob(result.stderr || '');
//       const compile_output = atob(result.compile_output || '');
//       const status = result.status;

//       if (status.id !== 3) {
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   return (
//     <div ref={editorContainerRef} className="h-full flex flex-col bg-slate-950">
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Selector */}
//         <select
//           className="p-2 bg-gray-300 text-black rounded"
//           value={language}
//           onChange={(e) => handleLanguageSwitch(e.target.value)}
//         >
//           {languageOptions.map((lang) => (
//             <option key={lang.id} value={lang.id}>
//               {lang.name}
//             </option>
//           ))}
//         </select>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
//             onClick={() => setTheme(theme === 'default' ? 'eclipse' : 'default')}
//           >
//             Toggle Theme
//           </button>
//         </div>

//         {/* Save Button */}
//         <button onClick={handleSave} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
//           Save
//         </button>

//         {/* Run Button */}
//         <button onClick={handleRun} disabled={isCompiling} className={`ml-4 px-4 py-2 ${isCompiling ? 'bg-gray-500' : 'bg-green-600'} text-white rounded`}>
//           {isCompiling ? 'Running...' : 'Run'}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Output Section */}
//       <div className="p-4 overflow-y-auto bg-gray-100" style={{ height: '200px' }}>
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;

// // finallll -1
// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css'; // Main CodeMirror CSS
// import { saveAs } from 'file-saver'; // Library to save files

// // Importing CodeMirror themes
// import 'codemirror/theme/eclipse.css';
// import 'codemirror/theme/solarized.css';
// import 'codemirror/theme/monokai.css';
// import 'codemirror/theme/material.css';
// import 'codemirror/theme/dracula.css';

// // Importing CodeMirror modes
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/mode/clike/clike';

// // Importing CodeMirror addons
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';

// import ACTIONS from '../Actions';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import debounce from 'lodash.debounce'; // Import debounce

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const [language, setLanguage] = useState('63'); // Default to JavaScript
//   const [output, setOutput] = useState('');
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem('preferred-theme') || 'eclipse';
//   }); // Default theme
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false); // Theme dropdown state

//   const [languageCodes, setLanguageCodes] = useState({
//     50: '', // C
//     54: '', // C++
//     62: '', // Java
//     71: '', // Python
//     63: '', // JavaScript
//   });

//   const languageOptions = [
//     { id: 50, name: 'C', mode: 'text/x-csrc', ext: 'c' },
//     { id: 54, name: 'C++', mode: 'text/x-c++src', ext: 'cpp' },
//     { id: 62, name: 'Java', mode: 'text/x-java', ext: 'java' },
//     { id: 71, name: 'Python', mode: 'python', ext: 'py' },
//     { id: 63, name: 'JavaScript', mode: 'javascript', ext: 'js' },
//   ];

//   const themeOptions = [
//     { name: 'Eclipse', value: 'eclipse' },
//     { name: 'Solarized Light', value: 'solarized' }, // Changed value to match imported theme
//     { name: 'Monokai', value: 'monokai' },
//     { name: 'Material Light', value: 'material' },
//     { name: 'Dracula', value: 'dracula' },
//   ];

//   const codeTemplates = {
//     50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//     54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
//     62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
//     71: `print('Hello World')`,
//     63: `console.log('Hello World');`,
//   };

//   // Initialize CodeMirror once
//   useEffect(() => {
//     if (!editorRef.current) {
//       editorRef.current = Codemirror.fromTextArea(
//         document.getElementById('realtimeEditor'),
//         {
//           mode:
//             languageOptions.find((lang) => lang.id === parseInt(language))
//               ?.mode || 'javascript',
//           theme: theme === 'default' ? 'default' : theme,
//           lineNumbers: true,
//           autoCloseBrackets: true,
//           autoCloseTags: true,
//           tabSize: 2,
//           indentUnit: 2,
//         }
//       );

//       // Load initial code
//       const initialCode = languageCodes[language] || codeTemplates[language];
//       editorRef.current.setValue(initialCode);
//       onCodeChange(initialCode);
//       codeRef.current = initialCode;

//       const emitCodeChange = debounce((code) => {
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       }, 300);

//       editorRef.current.on('change', (instance, changes) => {
//         const { origin } = changes;
//         const code = instance.getValue();
//         onCodeChange(code);

//         if (origin !== 'setValue') {
//           emitCodeChange(code);
//         }
//       });
//     }

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Empty dependency array to run once

//   // Handle language changes
//   useEffect(() => {
//     if (editorRef.current) {
//       // Update mode
//       const selectedLanguage = languageOptions.find(
//         (lang) => lang.id === parseInt(language)
//       );
//       if (selectedLanguage) {
//         editorRef.current.setOption('mode', selectedLanguage.mode);
//       }

//       // Load code for the selected language
//       const savedCode = languageCodes[language] || codeTemplates[language];
//       editorRef.current.setValue(savedCode);
//       onCodeChange(savedCode);
//       codeRef.current = savedCode;
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [language]);

//   // Handle theme changes
//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption('theme', theme);
//       localStorage.setItem('preferred-theme', theme);
//     }
//   }, [theme]);

//   // Handle socket events
//   useEffect(() => {
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         // Save current code before setting new code
//         setLanguageCodes((prevCodes) => ({
//           ...prevCodes,
//           [language]: editorRef.current.getValue(),
//         }));

//         editorRef.current.setValue(code);
//         onCodeChange(code);
//         codeRef.current = code;
//       }
//     };

//     const handleLanguageChange = ({ languageId, code }) => {
//       // Save current code before switching language
//       setLanguageCodes((prevCodes) => ({
//         ...prevCodes,
//         [language]: editorRef.current.getValue(),
//       }));

//       // Switch language
//       setLanguage(languageId);

//       // Update editor mode and content will be handled by the language useEffect
//       if (editorRef.current) {
//         const selectedLanguage = languageOptions.find(
//           (lang) => lang.id === parseInt(languageId)
//         );
//         if (selectedLanguage) {
//           // The actual setting of mode and code is handled by the language useEffect
//           // So we just need to update the state
//           // editorRef.current.setValue(code);
//           // onCodeChange(code);
//           // codeRef.current = code;
//         }
//       }
//     };

//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//       socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//         socketRef.current.off(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
//       }
//     };
//   }, [socketRef, roomId, language, languageOptions, onCodeChange]);

//   // Function to handle language switch and emit the change to other users
//   const handleLanguageSwitch = (newLanguageId) => {
//     if (newLanguageId === language) return; // No change

//     const currentCode = editorRef.current.getValue();

//     // Save the current code in the state associated with the current language
//     setLanguageCodes((prevCodes) => ({
//       ...prevCodes,
//       [language]: currentCode, // Store current language code
//     }));

//     // Emit language and code change to all clients in the room
//     if (socketRef.current) {
//       socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
//         roomId,
//         languageId: newLanguageId,
//         code: currentCode,
//       });
//     }

//     // Switch language locally
//     setLanguage(newLanguageId);
//     // The actual loading of the new language's code is handled by the language useEffect
//   };

//   // Function to save the code to a file
//   const handleSave = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === parseInt(language)
//     );

//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     const blob = new Blob([sourceCode], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, `code.${selectedLanguage.ext}`);
//     toast.success(`File saved as code.${selectedLanguage.ext}`);
//   };

//   // Function to compile and run the code
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput('Running...');

//       const response = await axios.post('/api/compile', {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: '',
//       });

//       const result = response.data;
//       const output = atob(result.stdout || '');
//       const stderr = atob(result.stderr || '');
//       const compile_output = atob(result.compile_output || '');
//       const status = result.status;

//       if (status.id !== 3) {
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   return (
//     <div ref={editorContainerRef} className="h-full flex flex-col bg-slate-950">
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Selector */}
//         <select
//           className="p-2 bg-gray-300 text-black rounded"
//           value={language}
//           onChange={(e) => handleLanguageSwitch(e.target.value)}
//         >
//           {languageOptions.map((lang) => (
//             <option key={lang.id} value={lang.id}>
//               {lang.name}
//             </option>
//           ))}
//         </select>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? 'font-semibold' : ''
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Save Button */}
//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
//         >
//           Save
//         </button>

//         {/* Run Button */}
//         <button
//           onClick={handleRun}
//           className="ml-4 px-4 py-2 bg-green-600 text-white rounded"
//           disabled={isCompiling}
//         >
//           {isCompiling ? 'Running...' : 'Run'}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Output Section */}
//       <div className="p-4 overflow-y-auto bg-gray-100" style={{ height: '200px' }}>
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css'; // Main CodeMirror CSS
// import { saveAs } from 'file-saver'; // Library to save files

// // Importing CodeMirror themes
// import 'codemirror/theme/eclipse.css';
// import 'codemirror/theme/solarized.css';
// import 'codemirror/theme/monokai.css';
// import 'codemirror/theme/material.css';
// import 'codemirror/theme/dracula.css';

// // Importing CodeMirror modes
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/python/python';
// import 'codemirror/mode/clike/clike';

// // Importing CodeMirror addons
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';

// import ACTIONS from '../Actions';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import debounce from 'lodash.debounce'; // Import debounce
// import { gsap } from 'gsap'; // Import GSAP

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const outputRef = useRef(null); // Reference for output console
//   const [language, setLanguage] = useState('63'); // Default to JavaScript
//   const [output, setOutput] = useState('');
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem('preferred-theme') || 'eclipse';
//   }); // Default theme
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false); // Theme dropdown state

//   const [languageCodes, setLanguageCodes] = useState({
//     50: '', // C
//     54: '', // C++
//     62: '', // Java
//     71: '', // Python
//     63: '', // JavaScript
//   });

//   const languageOptions = [
//     { id: 50, name: 'C', mode: 'text/x-csrc', ext: 'c' },
//     { id: 54, name: 'C++', mode: 'text/x-c++src', ext: 'cpp' },
//     { id: 62, name: 'Java', mode: 'text/x-java', ext: 'java' },
//     { id: 71, name: 'Python', mode: 'python', ext: 'py' },
//     { id: 63, name: 'JavaScript', mode: 'javascript', ext: 'js' },
//   ];

//   const themeOptions = [
//     { name: 'Eclipse', value: 'eclipse' },
//     { name: 'Solarized Light', value: 'solarized' }, // Changed value to match imported theme
//     { name: 'Monokai', value: 'monokai' },
//     { name: 'Material Light', value: 'material' },
//     { name: 'Dracula', value: 'dracula' },
//   ];

//   const codeTemplates = {
//     50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//     54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
//     62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
//     71: `print('Hello World')`,
//     63: `console.log('Hello World');`,
//   };

//   // Initialize CodeMirror once
//   useEffect(() => {
//     if (!editorRef.current) {
//       editorRef.current = Codemirror.fromTextArea(
//         document.getElementById('realtimeEditor'),
//         {
//           mode:
//             languageOptions.find((lang) => lang.id === parseInt(language))
//               ?.mode || 'javascript',
//           theme: theme === 'default' ? 'default' : theme,
//           lineNumbers: true,
//           autoCloseBrackets: true,
//           autoCloseTags: true,
//           tabSize: 2,
//           indentUnit: 2,
//         }
//       );

//       // Load initial code
//       const initialCode = languageCodes[language] || codeTemplates[language];
//       editorRef.current.setValue(initialCode);
//       onCodeChange(initialCode);
//       codeRef.current = initialCode;

//       const emitCodeChange = debounce((code) => {
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       }, 300);

//       editorRef.current.on('change', (instance, changes) => {
//         const { origin } = changes;
//         const code = instance.getValue();
//         onCodeChange(code);

//         if (origin !== 'setValue') {
//           emitCodeChange(code);
//         }
//       });
//     }

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Empty dependency array to run once

//   // Handle language changes
//   useEffect(() => {
//     if (editorRef.current) {
//       // Update mode
//       const selectedLanguage = languageOptions.find(
//         (lang) => lang.id === parseInt(language)
//       );
//       if (selectedLanguage) {
//         editorRef.current.setOption('mode', selectedLanguage.mode);
//       }

//       // Load code for the selected language
//       const savedCode = languageCodes[language] || codeTemplates[language];
//       editorRef.current.setValue(savedCode);
//       onCodeChange(savedCode);
//       codeRef.current = savedCode;

//       // Animate the output console when language changes
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [language]);

//   // Handle theme changes
//   useEffect(() => {
//     if (editorRef.current) {
//       // Animate theme change
//       gsap.to(editorContainerRef.current, {
//         backgroundColor: getThemeBackgroundColor(theme),
//         duration: 0.5,
//       });

//       editorRef.current.setOption('theme', theme);
//       localStorage.setItem('preferred-theme', theme);

//       // Trigger animation for output console theme change
//       if (outputRef.current) {
//         gsap.to(outputRef.current, {
//           backgroundColor: getOutputBackgroundColor(theme),
//           color: getOutputTextColor(theme),
//           duration: 0.5,
//         });
//       }
//     }
//   }, [theme]);

//   // Handle socket events
//   useEffect(() => {
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         // Save current code before setting new code
//         setLanguageCodes((prevCodes) => ({
//           ...prevCodes,
//           [language]: editorRef.current.getValue(),
//         }));

//         editorRef.current.setValue(code);
//         onCodeChange(code);
//         codeRef.current = code;

//         // Animate output console on code change
//         if (outputRef.current) {
//           gsap.fromTo(
//             outputRef.current,
//             { opacity: 0, y: -20 },
//             { opacity: 1, y: 0, duration: 0.5 }
//           );
//         }
//       }
//     };

//     const handleLanguageChange = ({ languageId, code }) => {
//       // Save current code before switching language
//       setLanguageCodes((prevCodes) => ({
//         ...prevCodes,
//         [language]: editorRef.current.getValue(),
//       }));

//       // Switch language
//       setLanguage(languageId);
//     };

//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//       socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//         socketRef.current.off(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
//       }
//     };
//   }, [socketRef, roomId, language, languageOptions, onCodeChange]);

//   // Function to handle language switch and emit the change to other users
//   const handleLanguageSwitch = (newLanguageId) => {
//     if (newLanguageId === language) return; // No change

//     const currentCode = editorRef.current.getValue();

//     // Save the current code in the state associated with the current language
//     setLanguageCodes((prevCodes) => ({
//       ...prevCodes,
//       [language]: currentCode, // Store current language code
//     }));

//     // Emit language and code change to all clients in the room
//     if (socketRef.current) {
//       socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
//         roomId,
//         languageId: newLanguageId,
//         code: currentCode,
//       });
//     }

//     // Switch language locally
//     setLanguage(newLanguageId);
//     // The actual loading of the new language's code is handled by the language useEffect
//   };

//   // Function to save the code to a file
//   const handleSave = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === parseInt(language)
//     );

//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     const blob = new Blob([sourceCode], { type: 'text/plain;charset=utf-8' });
//     saveAs(blob, `code.${selectedLanguage.ext}`);
//     toast.success(`File saved as code.${selectedLanguage.ext}`);
//   };

//   // Function to compile and run the code
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error('Source code cannot be empty!');
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput('Running...');

//       // Animate the output console when running code
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }

//       const response = await axios.post('/api/compile', {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: '',
//       });

//       const result = response.data;
//       const output = atob(result.stdout || '');
//       const stderr = atob(result.stderr || '');
//       const compile_output = atob(result.compile_output || '');
//       const status = result.status;

//       if (status.id !== 3) {
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }

//       // Animate the output console after receiving the result
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);

//       // Animate the output console on error
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   // Helper functions to get colors based on theme
//   const getThemeBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case 'eclipse':
//         return '#f5f5f5';
//       case 'solarized':
//         return '#fdf6e3';
//       case 'monokai':
//         return '#272822';
//       case 'material':
//         return '#263238';
//       case 'dracula':
//         return '#282a36';
//       default:
//         return '#ffffff';
//     }
//   };

//   const getOutputBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case 'eclipse':
//         return '#ffffff';
//       case 'solarized':
//         return '#fdf6e3';
//       case 'monokai':
//         return '#3e3d32';
//       case 'material':
//         return '#37474f';
//       case 'dracula':
//         return '#44475a';
//       default:
//         return '#ffffff';
//     }
//   };

//   const getOutputTextColor = (currentTheme) => {
//     switch (currentTheme) {
//       case 'eclipse':
//         return '#000000';
//       case 'solarized':
//         return '#657b83';
//       case 'monokai':
//         return '#f8f8f2';
//       case 'material':
//         return '#eceff1';
//       case 'dracula':
//         return '#f8f8f2';
//       default:
//         return '#000000';
//     }
//   };

//   return (
//     <div
//       ref={editorContainerRef}
//       className="h-full flex flex-col transition-colors duration-500"
//       style={{ backgroundColor: getThemeBackgroundColor(theme) }}
//     >
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Selector */}
//         <select
//           className="p-2 bg-gray-300 text-black rounded"
//           value={language}
//           onChange={(e) => handleLanguageSwitch(e.target.value)}
//         >
//           {languageOptions.map((lang) => (
//             <option key={lang.id} value={lang.id}>
//               {lang.name}
//             </option>
//           ))}
//         </select>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? 'font-semibold' : ''
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Save Button */}
//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
//         >
//           Save
//         </button>

//         {/* Run Button */}
//         <button
//           onClick={handleRun}
//           className={`ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300 ${
//             isCompiling ? 'opacity-50 cursor-not-allowed' : ''
//           }`}
//           disabled={isCompiling}
//         >
//           {isCompiling ? 'Running...' : 'Run'}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Output Section */}
//       <div
//         ref={outputRef}
//         className="p-4 overflow-y-auto transition-colors duration-500"
//         style={{
//           backgroundColor: getOutputBackgroundColor(theme),
//           color: getOutputTextColor(theme),
//           height: '200px',
//         }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;

// src/components/Editor.js
























































































// import React, { useEffect, useRef, useState } from "react";
// import Codemirror from "codemirror";
// import "codemirror/lib/codemirror.css"; // Main CodeMirror CSS
// import { saveAs } from "file-saver"; // Library to save files

// // Importing CodeMirror themes
// import "codemirror/theme/eclipse.css";
// import "codemirror/theme/solarized.css";
// import "codemirror/theme/monokai.css";
// import "codemirror/theme/material.css";
// import "codemirror/theme/dracula.css";

// // Importing CodeMirror modes
// import "codemirror/mode/javascript/javascript";
// import "codemirror/mode/python/python";
// import "codemirror/mode/clike/clike";

// // Importing CodeMirror addons
// import "codemirror/addon/edit/closetag";
// import "codemirror/addon/edit/closebrackets";

// import ACTIONS from "../Actions";
// import toast from "react-hot-toast";
// import axios from "axios";
// import debounce from "lodash.debounce"; // Import debounce
// import { gsap } from "gsap"; // Import GSAP
// import { useLocation } from "react-router-dom"; // To access navigation state

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const outputRef = useRef(null); // Reference for output console
//   const location = useLocation(); // Access the navigation state
//   const [language, setLanguage] = useState("63"); // Default to JavaScript
//   const [output, setOutput] = useState("");
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("preferred-theme") || "eclipse";
//   }); // Default theme
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false); // Theme dropdown state

//   // Define language options
//   const languageOptions = [
//     { id: "50", name: "C" },
//     { id: "54", name: "C++" },
//     { id: "62", name: "Java" },
//     { id: "71", name: "Python" },
//     { id: "63", name: "JavaScript" },
//     // Add more languages as needed
//   ];

//   // Define theme options
//   const themeOptions = [
//     { name: "Eclipse", value: "eclipse" },
//     { name: "Solarized Light", value: "solarized" }, // Ensure this matches the imported theme
//     { name: "Monokai", value: "monokai" },
//     { name: "Material Light", value: "material" },
//     { name: "Dracula", value: "dracula" },
//     // Add more themes as needed
//   ];

//   // Define template codes for each language
//   const codeTemplates = {
//     50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//     54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
//     62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
//     71: `print('Hello World')`,
//     63: `console.log('Hello World');`,
//   };

//   // Retrieve language from navigation state
//   useEffect(() => {
//     if (location.state && location.state.language) {
//       setLanguage(location.state.language);
//     } else {
//       // If no language is passed, default to JavaScript
//       setLanguage("63");
//       toast.error("No language selected. Defaulting to JavaScript.");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Initialize CodeMirror once
//   useEffect(() => {
//     if (!editorRef.current) {
//       editorRef.current = Codemirror.fromTextArea(
//         document.getElementById("realtimeEditor"),
//         {
//           mode:
//             languageOptions.find((lang) => lang.id === language)?.mode ||
//             "javascript",
//           theme: theme === "default" ? "default" : theme,
//           lineNumbers: true,
//           autoCloseBrackets: true,
//           autoCloseTags: true,
//           tabSize: 2,
//           indentUnit: 2,
//         }
//       );

//       // Load initial code based on the fixed language
//       const initialCode = codeTemplates[language] || "";
//       editorRef.current.setValue(initialCode);
//       onCodeChange(initialCode);
//       codeRef.current = initialCode;

//       const emitCodeChange = debounce((code) => {
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       }, 300);

//       editorRef.current.on("change", (instance, changes) => {
//         const { origin } = changes;
//         const code = instance.getValue();
//         onCodeChange(code);

//         if (origin !== "setValue") {
//           emitCodeChange(code);
//         }
//       });
//     }

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [language, theme]); // Initialize when language or theme changes

//   // Handle language changes (disabled)
//   // Since language is fixed, we remove the ability to change it

//   // Handle theme changes
//   useEffect(() => {
//     if (editorRef.current) {
//       // Animate theme change
//       gsap.to(editorContainerRef.current, {
//         backgroundColor: getThemeBackgroundColor(theme),
//         duration: 0.5,
//       });

//       editorRef.current.setOption("theme", theme);
//       localStorage.setItem("preferred-theme", theme);

//       // Trigger animation for output console theme change
//       if (outputRef.current) {
//         gsap.to(outputRef.current, {
//           backgroundColor: getOutputBackgroundColor(theme),
//           color: getOutputTextColor(theme),
//           duration: 0.5,
//         });
//       }
//     }
//   }, [theme]);

//   // Handle incoming code changes from other clients
//   useEffect(() => {
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         // Save current code before setting new code (if needed)
//         // Not necessary here since language is fixed

//         editorRef.current.setValue(code);
//         onCodeChange(code);
//         codeRef.current = code;

//         // Animate output console on code change
//         if (outputRef.current) {
//           gsap.fromTo(
//             outputRef.current,
//             { opacity: 0, y: -20 },
//             { opacity: 1, y: 0, duration: 0.5 }
//           );
//         }
//       }
//     };

//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef, roomId, languageOptions, onCodeChange]);

//   // Handle compilation of the code
//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error("Source code cannot be empty!");
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput("Running...");

//       // Animate the output console when running code
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }

//       const response = await axios.post("/api/compile", {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: "",
//       });

//       const result = response.data;
//       const output = atob(result.stdout || "");
//       const stderr = atob(result.stderr || "");
//       const compile_output = atob(result.compile_output || "");
//       const status = result.status;

//       if (status.id !== 3) {
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }

//       // Animate the output console after receiving the result
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);

//       // Animate the output console on error
//       if (outputRef.current) {
//         gsap.fromTo(
//           outputRef.current,
//           { opacity: 0, y: -20 },
//           { opacity: 1, y: 0, duration: 0.5 }
//         );
//       }
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   // Function to save the code to a file
//   const handleSave = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === language
//     );

//     if (!sourceCode.trim()) {
//       toast.error("Source code cannot be empty!");
//       return;
//     }

//     const blob = new Blob([sourceCode], { type: "text/plain;charset=utf-8" });
//     saveAs(blob, `code.${selectedLanguage.ext}`);
//     toast.success(`File saved as code.${selectedLanguage.ext}`);
//   };

//   // Helper functions to get colors based on theme
//   const getThemeBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse":
//         return "#f5f5f5";
//       case "solarized":
//         return "#fdf6e3";
//       case "monokai":
//         return "#272822";
//       case "material":
//         return "#263238";
//       case "dracula":
//         return "#282a36";
//       default:
//         return "#ffffff";
//     }
//   };

//   const getOutputBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse":
//         return "#ffffff";
//       case "solarized":
//         return "#fdf6e3";
//       case "monokai":
//         return "#3e3d32";
//       case "material":
//         return "#37474f";
//       case "dracula":
//         return "#44475a";
//       default:
//         return "#ffffff";
//     }
//   };

//   const getOutputTextColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse":
//         return "#000000";
//       case "solarized":
//         return "#657b83";
//       case "monokai":
//         return "#f8f8f2";
//       case "material":
//         return "#eceff1";
//       case "dracula":
//         return "#f8f8f2";
//       default:
//         return "#000000";
//     }
//   };

//   return (
//     <div
//       ref={editorContainerRef}
//       className="h-full flex flex-col transition-colors duration-500"
//       style={{ backgroundColor: getThemeBackgroundColor(theme) }}
//     >
//       {/* Toolbar Section */}
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         {/* Language Indicator (Optional) */}
//         <span className="mr-4 font-semibold">
//           Language: {languageOptions.find((lang) => lang.id === language)?.name}
//         </span>

//         {/* Theme Selector */}
//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? "font-semibold" : ""
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Save Button */}
//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
//         >
//           Save
//         </button>

//         {/* Run Button */}
//         <button
//           onClick={handleRun}
//           className={`ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300 ${
//             isCompiling ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           disabled={isCompiling}
//         >
//           {isCompiling ? "Running..." : "Run"}
//         </button>
//       </div>

//       {/* Code Editor Section */}
//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       {/* Output Section */}
//       <div
//         ref={outputRef}
//         className="p-4 overflow-y-auto transition-colors duration-500"
//         style={{
//           backgroundColor: getOutputBackgroundColor(theme),
//           color: getOutputTextColor(theme),
//           height: "200px",
//         }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;







































































// import React, { useEffect, useRef, useState } from "react";
// import Codemirror from "codemirror";
// import "codemirror/lib/codemirror.css";
// import { saveAs } from "file-saver";

// // Importing CodeMirror themes
// import "codemirror/theme/eclipse.css";
// import "codemirror/theme/solarized.css";
// import "codemirror/theme/monokai.css";
// import "codemirror/theme/material.css";
// import "codemirror/theme/dracula.css";

// // Importing CodeMirror modes
// import "codemirror/mode/javascript/javascript";
// import "codemirror/mode/python/python";
// import "codemirror/mode/clike/clike";

// // Importing CodeMirror addons
// import "codemirror/addon/edit/closetag";
// import "codemirror/addon/edit/closebrackets";

// import ACTIONS from "../Actions";
// import toast from "react-hot-toast";
// import axios from "axios";
// import debounce from "lodash.debounce";
// import { useLocation } from "react-router-dom";
// import './Editor.css';

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const outputRef = useRef(null);
//   const location = useLocation();
//   const [language, setLanguage] = useState("63");
//   const [output, setOutput] = useState("");
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("preferred-theme") || "eclipse";
//   });
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

//   const languageOptions = [
//     { id: "50", name: "C" },
//     { id: "54", name: "C++" },
//     { id: "62", name: "Java" },
//     { id: "71", name: "Python" },
//     { id: "63", name: "JavaScript" },
//   ];

//   const themeOptions = [
//     { name: "Eclipse", value: "eclipse" },
//     { name: "Solarized Light", value: "solarized" },
//     { name: "Monokai", value: "monokai" },
//     { name: "Material Light", value: "material" },
//     { name: "Dracula", value: "dracula" },
//   ];

//   const codeTemplates = {
//     50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//     54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
//     62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
//     71: `print('Hello World')`,
//     63: `console.log('Hello World');`,
//   };

//   useEffect(() => {
//     if (location.state && location.state.language) {
//       setLanguage(location.state.language);
//     } else {
//       setLanguage("63");
//       toast.error("No language selected. Defaulting to JavaScript.");
//     }
//   }, []);

//   useEffect(() => {
//     if (!editorRef.current) {
//       editorRef.current = Codemirror.fromTextArea(
//         document.getElementById("realtimeEditor"),
//         {
//           mode: languageOptions.find((lang) => lang.id === language)?.mode || "javascript",
//           theme: theme === "default" ? "default" : theme,
//           lineNumbers: true,
//           autoCloseBrackets: true,
//           autoCloseTags: true,
//           tabSize: 2,
//           indentUnit: 2,
//         }
//       );

//       const initialCode = codeTemplates[language] || "";
//       editorRef.current.setValue(initialCode);
//       onCodeChange(initialCode);
//       codeRef.current = initialCode;

//       const emitCodeChange = debounce((code) => {
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       }, 300);

//       editorRef.current.on("change", (instance, changes) => {
//         const { origin } = changes;
//         const code = instance.getValue();
//         onCodeChange(code);

//         if (origin !== "setValue") {
//           emitCodeChange(code);
//         }
//       });
//     }

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//   }, [language, theme]);

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption("theme", theme);
//       localStorage.setItem("preferred-theme", theme);
//     }
//   }, [theme]);

//   useEffect(() => {
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         editorRef.current.setValue(code);
//         onCodeChange(code);
//         codeRef.current = code;
//       }
//     };

//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef, roomId, languageOptions, onCodeChange]);

//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error("Source code cannot be empty!");
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput("Running...");

//       const response = await axios.post("/api/compile", {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: "",
//       });

//       const result = response.data;
//       const output = atob(result.stdout || "");
//       const stderr = atob(result.stderr || "");
//       const compile_output = atob(result.compile_output || "");
//       const status = result.status;

//       if (status.id !== 3) {
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   const handleSave = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find(
//       (lang) => lang.id === language
//     );

//     if (!sourceCode.trim()) {
//       toast.error("Source code cannot be empty!");
//       return;
//     }

//     const blob = new Blob([sourceCode], { type: "text/plain;charset=utf-8" });
//     saveAs(blob, `code.${selectedLanguage.ext}`);
//     toast.success(`File saved as code.${selectedLanguage.ext}`);
//   };

//   const getThemeBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse": return "#f5f5f5";
//       case "solarized": return "#fdf6e3";
//       case "monokai": return "#272822";
//       case "material": return "#263238";
//       case "dracula": return "#282a36";
//       default: return "#ffffff";
//     }
//   };

//   const getOutputBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse": return "#ffffff";
//       case "solarized": return "#fdf6e3";
//       case "monokai": return "#3e3d32";
//       case "material": return "#37474f";
//       case "dracula": return "#44475a";
//       default: return "#ffffff";
//     }
//   };

//   const getOutputTextColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse": return "#000000";
//       case "solarized": return "#657b83";
//       case "monokai": return "#f8f8f2";
//       case "material": return "#eceff1";
//       case "dracula": return "#f8f8f2";
//       default: return "#000000";
//     }
//   };

//   return (
//     <div
//       ref={editorContainerRef}
//       className="h-full flex flex-col transition-colors duration-500"
//       style={{ backgroundColor: getThemeBackgroundColor(theme) }}
//     >
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         <span className="mr-4 font-semibold">
//           Language: {languageOptions.find((lang) => lang.id === language)?.name}
//         </span>

//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </button>

//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? "font-semibold" : ""
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
//         >
//           Save
//         </button>

//         <button
//           onClick={handleRun}
//           className={`ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300 ${
//             isCompiling ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           disabled={isCompiling}
//         >
//           {isCompiling ? "Running..." : "Run"}
//         </button>
//       </div>

//       <textarea id="realtimeEditor" className="flex-1"></textarea>

//       <div
//         ref={outputRef}
//         className="p-4 overflow-y-auto transition-colors duration-500"
//         style={{
//           backgroundColor: getOutputBackgroundColor(theme),
//           color: getOutputTextColor(theme),
//           height: "200px",
//         }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;
























// import React, { useEffect, useRef, useState } from "react";
// import Codemirror from "codemirror";
// import "codemirror/lib/codemirror.css";
// import { saveAs } from "file-saver";

// // Importing CodeMirror themes
// import "codemirror/theme/eclipse.css";
// import "codemirror/theme/solarized.css";
// import "codemirror/theme/monokai.css";
// import "codemirror/theme/material.css";
// import "codemirror/theme/dracula.css";

// // Importing CodeMirror modes
// import "codemirror/mode/javascript/javascript";
// import "codemirror/mode/python/python";
// import "codemirror/mode/clike/clike";

// // Importing CodeMirror addons
// import "codemirror/addon/edit/closetag";
// import "codemirror/addon/edit/closebrackets";

// import ACTIONS from "../Actions";
// import toast from "react-hot-toast";
// import axios from "axios";
// import debounce from "lodash.debounce";
// import { useLocation } from "react-router-dom";

// const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
//   const editorRef = useRef(null);
//   const location = useLocation();
//   const [language, setLanguage] = useState("63");
//   const [output, setOutput] = useState("");
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [theme, setTheme] = useState(() => localStorage.getItem("preferred-theme") || "eclipse");
//   const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

//   const languageOptions = [
//     { id: "50", name: "C" },
//     { id: "54", name: "C++" },
//     { id: "62", name: "Java" },
//     { id: "71", name: "Python" },
//     { id: "63", name: "JavaScript" },
//   ];

//   const themeOptions = [
//     { name: "Eclipse", value: "eclipse" },
//     { name: "Solarized Light", value: "solarized" },
//     { name: "Monokai", value: "monokai" },
//     { name: "Material Light", value: "material" },
//     { name: "Dracula", value: "dracula" },
//   ];

//   const codeTemplates = {
//     50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
//     54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
//     62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
//     71: `print('Hello World')`,
//     63: `console.log('Hello World');`,
//   };

//   useEffect(() => {
//     if (location.state && location.state.language) {
//       setLanguage(location.state.language);
//     } else {
//       setLanguage("63");
//       toast.error("No language selected. Defaulting to JavaScript.");
//     }
//   }, [location.state]);

//   useEffect(() => {
//     if (!editorRef.current) {
//       editorRef.current = Codemirror.fromTextArea(
//         document.getElementById("realtimeEditor"),
//         {
//           mode: languageOptions.find((lang) => lang.id === language)?.mode || "javascript",
//           theme: theme === "default" ? "default" : theme,
//           lineNumbers: true,
//           autoCloseBrackets: true,
//           autoCloseTags: true,
//           tabSize: 2,
//           indentUnit: 2,
//         }
//       );

//       const initialCode = codeTemplates[language] || "";
//       editorRef.current.setValue(initialCode);
//       onCodeChange(initialCode);
//       codeRef.current = initialCode;

//       const emitCodeChange = debounce((code) => {
//         if (socketRef.current) {
//           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
//         }
//       }, 300);

//       editorRef.current.on("change", (instance, changes) => {
//         const { origin } = changes;
//         const code = instance.getValue();
//         onCodeChange(code);

//         if (origin !== "setValue") {
//           emitCodeChange(code);
//         }
//       });
//     }

//     return () => {
//       if (editorRef.current) {
//         editorRef.current.toTextArea();
//         editorRef.current = null;
//       }
//     };
//   }, [language, theme]);

//   useEffect(() => {
//     if (editorRef.current) {
//       editorRef.current.setOption("theme", theme);
//       localStorage.setItem("preferred-theme", theme);
//     }
//   }, [theme]);

//   useEffect(() => {
//     const handleCodeChange = ({ code }) => {
//       if (code !== null && editorRef.current.getValue() !== code) {
//         editorRef.current.setValue(code);
//         onCodeChange(code);
//         codeRef.current = code;
//       }
//     };

//     if (socketRef.current) {
//       socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//       }
//     };
//   }, [socketRef, roomId, languageOptions, onCodeChange]);

//   const handleRun = async () => {
//     const sourceCode = editorRef.current.getValue();
//     if (!sourceCode.trim()) {
//       toast.error("Source code cannot be empty!");
//       return;
//     }

//     try {
//       setIsCompiling(true);
//       setOutput("Running...");

//       const response = await axios.post("/api/compile", {
//         sourceCode,
//         languageId: parseInt(language),
//         stdin: "",
//       });

//       const result = response.data;
//       const output = atob(result.stdout || "");
//       const stderr = atob(result.stderr || "");
//       const compile_output = atob(result.compile_output || "");
//       const status = result.status;

//       if (status.id !== 3) {
//         setOutput(`${status.description}\n${compile_output || stderr}`);
//       } else {
//         setOutput(output);
//       }
//     } catch (error) {
//       setOutput(`Error: ${error.response?.data?.error || error.message}`);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   const handleSave = () => {
//     const sourceCode = editorRef.current.getValue();
//     const selectedLanguage = languageOptions.find((lang) => lang.id === language);

//     if (!sourceCode.trim()) {
//       toast.error("Source code cannot be empty!");
//       return;
//     }

//     const blob = new Blob([sourceCode], { type: "text/plain;charset=utf-8" });
//     saveAs(blob, `code.${selectedLanguage.ext}`);
//     toast.success(`File saved as code.${selectedLanguage.ext}`);
//   };

//   const getThemeBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse": return "#f5f5f5";
//       case "solarized": return "#fdf6e3";
//       case "monokai": return "#272822";
//       case "material": return "#263238";
//       case "dracula": return "#282a36";
//       default: return "#ffffff";
//     }
//   };

//   const getOutputBackgroundColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse": return "#ffffff";
//       case "solarized": return "#fdf6e3";
//       case "monokai": return "#3e3d32";
//       case "material": return "#37474f";
//       case "dracula": return "#44475a";
//       default: return "#ffffff";
//     }
//   };

//   const getOutputTextColor = (currentTheme) => {
//     switch (currentTheme) {
//       case "eclipse": return "#000000";
//       case "solarized": return "#657b83";
//       case "monokai": return "#f8f8f2";
//       case "material": return "#eceff1";
//       case "dracula": return "#f8f8f2";
//       default: return "#000000";
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col" style={{ backgroundColor: getThemeBackgroundColor(theme) }}>
//       <div className="flex items-center p-2 bg-gray-200 shadow">
//         <span className="mr-4 font-semibold">
//           Language: {languageOptions.find((lang) => lang.id === language)?.name}
//         </span>

//         <div className="relative ml-4">
//           <button
//             id="theme-button"
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
//             onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
//           >
//             Select Theme
//             <svg
//               className="w-4 h-4 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </button>

//           {isThemeDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//               <ul className="py-1">
//                 {themeOptions.map((themeOption) => (
//                   <li key={themeOption.value}>
//                     <button
//                       onClick={() => {
//                         setTheme(themeOption.value);
//                         setIsThemeDropdownOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
//                         theme === themeOption.value ? "font-semibold" : ""
//                       }`}
//                     >
//                       {themeOption.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         <button
//           onClick={handleSave}
//           className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
//         >
//           Save
//         </button>

//         <button
//           onClick={handleRun}
//           className={`ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300 ${
//             isCompiling ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           disabled={isCompiling}
//         >
//           {isCompiling ? "Running..." : "Run"}
//         </button>
//       </div>

//       <textarea id="realtimeEditor" className="flex-1 overflow-auto bg-gray-800 text-white"></textarea>

//       <div
//         className="p-4 overflow-y-auto transition-colors duration-500"
//         style={{
//           backgroundColor: getOutputBackgroundColor(theme),
//           color: getOutputTextColor(theme),
//           height: "200px",
//         }}
//       >
//         <h3 className="text-lg font-semibold mb-2">Output:</h3>
//         <pre className="whitespace-pre-wrap">{output}</pre>
//       </div>
//     </div>
//   );
// };

// export default Editor;










































import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import { saveAs } from "file-saver";

// Importing CodeMirror themes
import "codemirror/theme/eclipse.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/material.css";
import "codemirror/theme/dracula.css";

// Importing CodeMirror modes
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";

// Importing CodeMirror addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import axios from "axios";
import debounce from "lodash.debounce";
import { useLocation } from "react-router-dom";

// Import custom CSS
import './editor.css';

const Editor = ({ socketRef, roomId, onCodeChange, codeRef }) => {
  const editorRef = useRef(null);
  const location = useLocation();
  const [language, setLanguage] = useState("63");
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("preferred-theme") || "eclipse");
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const languageOptions = [
    { id: "50", name: "C", mode: "text/x-csrc", ext: "c" },
    { id: "54", name: "C++", mode: "text/x-c++src", ext: "cpp" },
    { id: "62", name: "Java", mode: "text/x-java", ext: "java" },
    { id: "71", name: "Python", mode: "text/x-python", ext: "py" },
    { id: "63", name: "JavaScript", mode: "text/javascript", ext: "js" },
  ];

  const themeOptions = [
    { name: "Eclipse", value: "eclipse" },
    { name: "Solarized Light", value: "solarized" },
    { name: "Monokai", value: "monokai" },
    { name: "Material Light", value: "material" },
    { name: "Dracula", value: "dracula" },
  ];

  const codeTemplates = {
    50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
    62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    71: `print('Hello World')`,
    63: `console.log('Hello World');`,
  };

  useEffect(() => {
    if (location.state && location.state.language) {
      setLanguage(location.state.language);
    } else {
      setLanguage("63");
      toast.error("No language selected. Defaulting to JavaScript.");
    }
  }, [location.state]);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: languageOptions.find((lang) => lang.id === language)?.mode || "javascript",
          theme: theme,
          lineNumbers: true,
          autoCloseBrackets: true,
          autoCloseTags: true,
          tabSize: 2,
          indentUnit: 2,
        }
      );

      const initialCode = codeTemplates[language] || "";
      editorRef.current.setValue(initialCode);
      onCodeChange(initialCode);
      codeRef.current = initialCode;

      const emitCodeChange = debounce((code) => {
        if (socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
        }
      }, 300);

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);

        if (origin !== "setValue") {
          emitCodeChange(code);
        }
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, [language, theme]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("theme", theme);
      localStorage.setItem("preferred-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleCodeChange = ({ code }) => {
      if (code !== null && editorRef.current.getValue() !== code) {
        editorRef.current.setValue(code);
        onCodeChange(code);
        codeRef.current = code;
      }
    };

    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      }
    };
  }, [socketRef, roomId, onCodeChange]);

  const handleRun = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode.trim()) {
      toast.error("Source code cannot be empty!");
      return;
    }

    try {
      setIsCompiling(true);
      setOutput("Running...");

      const response = await axios.post("/api/compile", {
        sourceCode,
        languageId: parseInt(language),
        stdin: "",
      });

      const result = response.data;
      const output = atob(result.stdout || "");
      const stderr = atob(result.stderr || "");
      const compile_output = atob(result.compile_output || "");
      const status = result.status;

      if (status.id !== 3) {
        setOutput(`${status.description}\n${compile_output || stderr}`);
      } else {
        setOutput(output);
      }
    } catch (error) {
      setOutput(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = () => {
    const sourceCode = editorRef.current.getValue();
    const selectedLanguage = languageOptions.find((lang) => lang.id === language);

    if (!sourceCode.trim()) {
      toast.error("Source code cannot be empty!");
      return;
    }

    const blob = new Blob([sourceCode], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `code.${selectedLanguage.ext}`);
    toast.success(`File saved as code.${selectedLanguage.ext}`);
  };

  const getThemeBackgroundColor = (currentTheme) => {
    switch (currentTheme) {
      case "eclipse": return "#f5f5f5";
      case "solarized": return "#fdf6e3";
      case "monokai": return "#272822";
      case "material": return "#263238";
      case "dracula": return "#282a36";
      default: return "#ffffff";
    }
  };

  const getOutputBackgroundColor = (currentTheme) => {
    switch (currentTheme) {
      case "eclipse": return "#ffffff";
      case "solarized": return "#fdf6e3";
      case "monokai": return "#3e3d32";
      case "material": return "#37474f";
      case "dracula": return "#44475a";
      default: return "#ffffff";
    }
  };

  const getOutputTextColor = (currentTheme) => {
    switch (currentTheme) {
      case "eclipse": return "#000000";
      case "solarized": return "#657b83";
      case "monokai": return "#f8f8f2";
      case "material": return "#eceff1";
      case "dracula": return "#f8f8f2";
      default: return "#000000";
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: getThemeBackgroundColor(theme) }}>
      <div className="flex items-center justify-between p-2 bg-gray-200 shadow">
        <div className="flex items-center">
          <span className="mr-2 font-semibold text-sm">
            {languageOptions.find((lang) => lang.id === language)?.name}
          </span>
          <div className="relative">
            <button
              id="theme-button"
              className="flex items-center px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md"
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            >
              Theme
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isThemeDropdownOpen && (
              <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul className="py-1">
                  {themeOptions.map((themeOption) => (
                    <li key={themeOption.value}>
                      <button
                        onClick={() => {
                          setTheme(themeOption.value);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                          theme === themeOption.value ? "font-semibold" : ""
                        }`}
                      >
                        {themeOption.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleSave}
            className="mr-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Save
          </button>
          <button
            onClick={handleRun}
            className={`px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300 ${
              isCompiling ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isCompiling}
          >
            {isCompiling ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <textarea id="realtimeEditor" className="w-full h-full"></textarea>
      </div>

      <div
        className="h-1/4 overflow-y-auto transition-colors duration-500"
        style={{
          backgroundColor: getOutputBackgroundColor(theme),
          color: getOutputTextColor(theme),
        }}
      >
        <h3 className="text-sm font-semibold p-2">Output:</h3>
        <pre className="whitespace-pre-wrap text-xs p-2">{output}</pre>
      </div>
    </div>
  );
};

export default Editor;








































































































































































