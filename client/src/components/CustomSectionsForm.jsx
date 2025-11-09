import { FileText, Plus, Trash2 } from 'lucide-react';
import React from 'react'
import QuillEditor from './QuillTextEditor';

const CustomSectionsForm = ({ data = [], onChange }) => {

const addCustomSection = () =>{
    const newSection = {
        section_name: "",
        content: ""
    };
    onChange([...data, newSection])
}

const removeCustomSection = (index)=>{
    const updated = data.filter((_, i)=> i !== index);
    onChange(updated)
}

const updateCustomSection = (index, field, value)=>{
    const updated = [...data];
    updated[index] = {...updated[index], [field]: value}
    onChange(updated)
}

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Custom Sections </h3>
            <p className='text-sm text-gray-500'>Add your own custom sections to your resume</p>
        </div>
        <button onClick={addCustomSection} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
            <Plus className="size-4"/>
            Add Section
        </button>
      </div>

      {data.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p>No custom sections added yet.</p>
            <p className="text-sm">Click "Add Section" to create your own custom sections.</p>
        </div>
      ): (
        <div className='space-y-4'>
            {data.map((section, index)=>(
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className='flex justify-between items-start'>
                        <h4 className='font-medium text-gray-700'>Custom Section #{index + 1}</h4>
                        <button onClick={()=> removeCustomSection(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                            <Trash2 className="size-4"/>
                        </button>
                    </div>

                    <div className='grid gap-3'>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Section Name
                            </label>
                            <input
                                value={section.section_name || ""}
                                onChange={(e)=>updateCustomSection(index, "section_name", e.target.value)}
                                type="text"
                                placeholder="e.g., Volunteer Work, Publications, Languages"
                                className="w-full min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Content
                            </label>
                            <div className='border border-gray-300 rounded-lg overflow-hidden max-w-full'>
                                <div className="max-w-full overflow-x-hidden">
                                    <QuillEditor
                                        content={section.content || ""}
                                        onTextChange={(value) => updateCustomSection(index, "content", value)}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default CustomSectionsForm
