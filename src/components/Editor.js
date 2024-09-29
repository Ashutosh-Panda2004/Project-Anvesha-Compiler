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
import './Editor.css';

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








































































































































































