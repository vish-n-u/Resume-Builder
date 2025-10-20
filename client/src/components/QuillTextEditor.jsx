import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ({ content, onTextChange, onSelectionChange, readOnly }) => {
  console.log("content==>",content)
  const [value,setValue] = useState(content)

  // Sync internal state with content prop when it changes externally
  useEffect(() => {
    setValue(content)
  }, [content])

  useEffect(()=>{
    onTextChange(value)
  },[value])

  return <ReactQuill style={{fontSize:"40px"}} theme="snow" value={value} onChange={setValue} />;
};

export default QuillEditor;