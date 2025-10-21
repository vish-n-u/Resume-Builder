import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import React from 'react'
import QuillEditor from './QuillTextEditor'

const ProjectForm = ({ data, onChange }) => {

const addProject = () =>{
    const newProject = {
        name: "",
        type: "",
        description: "",
    };
    onChange([...data, newProject])
}

const removeProject = (index)=>{
    const updated = data.filter((_, i)=> i !== index);
    onChange(updated)
}

const updateProject = (index, field, value)=>{
    const updated = [...data];
    updated[index] = {...updated[index], [field]: value}
    onChange(updated)
}

const moveProjectUp = (index) => {
    if (index === 0) return; // Can't move up if it's the first item
    const updated = [...data];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
}

const moveProjectDown = (index) => {
    if (index === data.length - 1) return; // Can't move down if it's the last item
    const updated = [...data];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
}

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Projects </h3>
            <p className='text-sm text-gray-500'>Add your projects</p>
        </div>
        <button onClick={addProject} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
            <Plus className="size-4"/>
            Add Project
        </button>
      </div>

      
        <div className='space-y-4 mt-6'>
            {data.map((project, index)=>(
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className='flex justify-between items-start'>
                        <h4>Project #{index + 1}</h4>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={()=> moveProjectUp(index)}
                                disabled={index === 0}
                                className={`${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'} transition-colors`}
                                title="Move up"
                            >
                                <ChevronUp className="size-4"/>
                            </button>
                            <button
                                onClick={()=> moveProjectDown(index)}
                                disabled={index === data.length - 1}
                                className={`${index === data.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'} transition-colors`}
                                title="Move down"
                            >
                                <ChevronDown className="size-4"/>
                            </button>
                            <button onClick={()=> removeProject(index)} className='text-red-500 hover:text-red-700 transition-colors' title="Delete">
                                <Trash2 className="size-4"/>
                            </button>
                        </div>
                    </div>

                    <div className='grid gap-3'>

                        <input value={project.name || ""} onChange={(e)=>updateProject(index, "name", e.target.value)} type="text" placeholder="Project Name" className="px-3 py-2 text-sm rounded-lg"/>

                        <input value={project.type || ""} onChange={(e)=>updateProject(index, "type", e.target.value)} type="text" placeholder="Project Type" className="px-3 py-2 text-sm rounded-lg"/>

                        <div className="space-y-2">
                            <label className='text-sm font-medium text-gray-700'>Project Description</label>
                            <QuillEditor content={project.description || ""} onTextChange={(value)=> updateProject(index, "description", value)} />
                        </div>
            
                    </div>


                </div>
            ))}
        </div>
     
    </div>
  )
}

export default ProjectForm
