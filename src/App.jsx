import { useState } from 'react'
import * as Tone from "tone";
import viteLogo from '/vite.svg'
import { tones } from './tones.js'

function App() {
  const [osc, setOsc] = useState(null);
  const [recordedNotes, setRecordedNotes] = useState([]);

  const handleClear = () => {
    setRecordedNotes([]);
  }

  const handleClick = (tone) => {
    const startTime = Date.now(); // Record the start time
    const temp = new Tone.Oscillator(tone.frequency, "square").toDestination();
    setOsc(temp);
    temp.start();

    setRecordedNotes(prevNotes => [
      ...prevNotes,
      { tone: tone, startTime, endTime: null }
    ]);
  }

  const handleClickRelease = (tone) => {
    if (osc) {
      osc.stop();
      setOsc(null);

      setRecordedNotes(prevNotes => {
        const updatedNotes = [...prevNotes];
        const lastNoteIndex = updatedNotes.length - 1;
        if (updatedNotes[lastNoteIndex] && updatedNotes[lastNoteIndex].tone.note === tone.note) {
          updatedNotes[lastNoteIndex] = {
            ...updatedNotes[lastNoteIndex],
            endTime: Date.now(),
            duration: (Date.now() - updatedNotes[lastNoteIndex].startTime) / 1000 // duration in seconds
          };
        }
        return updatedNotes;
      });
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-blue-500 min-h-screen flex justify-center">
      <div className="flex flex-col items-center max-w-6xl w-full m-4 p-4 gap-6 bg-white rounded-md">
        
        <div className="text-lg md:text-2xl font-bold text-center text-gray-800">Tone Maker</div> 

        <div className="flex flex-wrap gap-2 justify-center">
          {tones.map((tone) =>
            <button 
              key={tone.note} 
              onMouseDown={() => handleClick(tone)}
              onMouseUp={() => handleClickRelease(tone)}
              className="bg-slate-200 hover:bg-slate-300 p-0.5 w-24 rounded flex flex-col items-center"
            >
              <div className="text-sm">
                {tone.note}
              </div>
              <div className="text-xs">
                {tone.frequency}
              </div>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-base md:text-lg font-bold text-center text-gray-800">Recorded Notes</div> 
          <button
            onClick={() => handleClear()}
            className="bg-slate-200 hover:bg-slate-300 p-2"
          >
            Clear
          </button>
          {recordedNotes.map((note, index) => (
            <div key={`${index}-${note.tone.note}`} className=''>
                {note.tone.note} ({note.tone.frequency}) - {note.duration} seconds
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App
