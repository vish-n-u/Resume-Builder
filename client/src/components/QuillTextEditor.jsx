import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './QuillTextEditor.css';

const QuillEditor = ({ content, onTextChange, onSelectionChange, readOnly }) => {
  const [value,setValue] = useState(content)

  // Sync internal state with content prop when it changes externally
  useEffect(() => {
    setValue(content)
  }, [content])

  useEffect(()=>{
    onTextChange(value)
  },[value])

  return <ReactQuill className="quill-editor-large" theme="snow" value={value} onChange={setValue} />;
};

export default QuillEditor;