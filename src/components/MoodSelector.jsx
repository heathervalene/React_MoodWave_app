import { useState } from "react";

const MoodSelector = () => {

const [selectedMood, setSelectedMood] = useState("");

const handleMoodChange = (e) => {
  setSelectedMood(e.target.value)
}

const handleSubmit = (e) => {
  e.preventDefault();
  onselect(selectedMood);
}


  return (
    <div>
      <form onSubmit={handleSubmit}>
       <label>Select Mood:
       <select value={selectedMood} onChange={handleMoodChange}>
    <option value="">Select</option>
    <option value="Happy">Happy</option>
    <option value="Sad">Sad</option>
    <option value="Angry">Angry</option>
    <option value="Bored">Bored</option>
       </select>
       </label>
       <button type="submit">Generate Playlist</button>
      </form>
    </div>
  )
}

export default MoodSelector;