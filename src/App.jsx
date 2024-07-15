import { useState } from 'react'
import * as Tone from "tone";
import { tones } from './tones.js'

function App() {
  const [osc, setOsc] = useState(null);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [generatedCode, setGeneratedCode] = useState(null);

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

  const handlePlayback = async () => {
    for (const note of recordedNotes) {
      const temp = new Tone.Oscillator(note.tone.frequency, "square").toDestination();
      temp.start();
      await new Promise(resolve => setTimeout(resolve, note.duration * 1000));
      temp.stop();
    }
  }
  
  const handleCodeGenerate = () => {
    const code = generateMelodyArray(recordedNotes);
    setGeneratedCode(code);
  }

  const generateMelodyArray = (recordedNotes) => {
    const generated = recordedNotes.map(note => {
      console.log(note);
      const duration = convertDurationToNoteLength(note.duration);
      return `{ ${note.tone.note}, ${duration} }`;
    }).join(', ');
    return `{ ${generated} }`;
  };


  const convertDurationToNoteLength = (duration) => {
    if (duration >= 1.5) return -4; // Dotted quarter note
    if (duration >= 1) return 4;    // Quarter note
    if (duration >= 0.75) return -8; // Dotted eighth note
    if (duration >= 0.5) return 8;  // Eighth note
    if (duration >= 0.375) return -16; // Dotted sixteenth note
    if (duration >= 0.25) return 16; // Sixteenth note
    // Add more conversions as needed
    return 8; // Default to eighth note if duration doesn't match any known value
  };

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

        <div className="flex flex-col gap-1 w-full items-center">
          <div className="text-base md:text-lg font-bold text-center text-gray-800">Recorded Notes</div> 
          <button
            onClick={() => handlePlayback()}
            className="w-1/3 bg-blue-600 text-white hover:bg-slate-800 rounded p-2"
          >
            Play
          </button>
          <button
            onClick={() => handleClear()}
            className="w-1/3 bg-slate-200 hover:bg-slate-300 rounded p-2"
          >
            Clear
          </button>
          {recordedNotes.map((note, index) => (
            <div key={`${index}-${note.tone.note}`} className=''>
                {note.tone.note} ({note.tone.frequency}) - {note.duration ? `${note.duration} seconds` : 'playing'}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 w-full items-center">
          <div className="text-base md:text-lg font-bold text-center text-gray-800">Generate Code</div> 
          <div className="text-xs md:text-sm font-bold text-center text-gray-600">
            I used 
              <a href="https://github.com/robsoncouto/arduino-songs/tree/master" className="text-blue-400"> this example </a> 
            for the format of this generated code <br/>
            NOTE: The durations will be mapped to the following: <br/>
            Greater than or equal to 1.5 seconds: -4 (dotted quarter note) <br/>
            Greater than or equal to 1 second: 4 (quarter note) <br/>
            Greater than or equal to 0.75 seconds: -8 (dotted eighth note) <br/>
            Greater than or equal to 0.5 seconds: 8 (eighth note) <br/>
            Greater than or equal to 0.375 seconds: -16 (dotted sixteenth note) <br/>
            Greater than or equal to 0.25 seconds: 16 (sixteenth note) <br/>
          </div>

          <button
              onClick={() => handleCodeGenerate()}
              className="w-1/3 bg-blue-600 text-white hover:bg-slate-800 rounded p-2"
            >
              Generate
          </button>

          {generatedCode && 
            <div>
              {generatedCode}
            </div>
          }

      </div>

      </div>
    </div>
  )
}

export default App
