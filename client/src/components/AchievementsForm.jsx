import { Trophy, Plus, Trash2 } from 'lucide-react';
import React from 'react'

const AchievementsForm = ({ data = [], onChange }) => {

const addAchievement = () =>{
    const newAchievement = {
        title: "",
        description: "",
        date: ""
    };
    onChange([...data, newAchievement])
}

const removeAchievement = (index)=>{
    const updated = data.filter((_, i)=> i !== index);
    onChange(updated)
}

const updateAchievement = (index, field, value)=>{
    const updated = [...data];
    updated[index] = {...updated[index], [field]: value}
    onChange(updated)
}

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Achievements </h3>
            <p className='text-sm text-gray-500'>Highlight your accomplishments and awards</p>
        </div>
        <button onClick={addAchievement} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
            <Plus className="size-4"/>
            Add Achievement
        </button>
      </div>

      {data.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p>No achievements added yet.</p>
            <p className="text-sm">Click "Add Achievement" to get started.</p>
        </div>
      ): (
        <div className='space-y-4'>
            {data.map((achievement, index)=>(
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className='flex justify-between items-start'>
                        <h4>Achievement #{index + 1}</h4>
                        <button onClick={()=> removeAchievement(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                            <Trash2 className="size-4"/>
                        </button>
                    </div>

                    <div className='grid gap-3'>

                        <input value={achievement.title || ""} onChange={(e)=>updateAchievement(index, "title", e.target.value)} type="text" placeholder="Achievement Title" className="px-3 py-2 text-sm"/>

                        <textarea value={achievement.description || ""} onChange={(e)=>updateAchievement(index, "description", e.target.value)} placeholder="Description of your achievement" className="px-3 py-2 text-sm resize-none" rows={3}/>

                        <input value={achievement.date || ""} onChange={(e)=>updateAchievement(index, "date", e.target.value)} type="month" className="px-3 py-2 text-sm" placeholder="Date"/>

                    </div>

                </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default AchievementsForm
