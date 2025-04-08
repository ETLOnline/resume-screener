import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";  // ✅ Import Link for navigation
import { db, collection, addDoc, deleteDoc, doc, updateDoc } from "../../services/firebase";
import { getDocs } from "firebase/firestore";


const PromptsPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [promptName, setPromptName] = useState("");
  const [detailedPrompt, setDetailedPrompt] = useState("");
  const [editingId, setEditingId] = useState(null); // Track editing ID
  const [selectedRole, setSelectedRole] = useState("");  // ✅ New State for Role Selection

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const querySnapshot = await getDocs(collection(db, "prompts"));
    const loadedPrompts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      role: doc.data().role || "No role assigned",  // ✅ Load role or show default text
      prompt: doc.data().prompt,
    }));
  
    if (loadedPrompts.length === 0) {
      console.log("No prompts found in the database."); // Debugging message
    }
  
    setPrompts(loadedPrompts);
  };

  const handleCancelEdit = () => {
    setEditingId(null);  // ✅ Exit edit mode
    setPromptName("");   // ✅ Reset fields
    setSelectedRole("");
    setDetailedPrompt("");
  };

  const handleAddPrompt = async () => {
    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(promptName)) {
      alert("Prompt Name/ID must be alphanumeric (letters, numbers, underscores) only!");
      return;
    }
    if (prompts.some(p => p.name === promptName)) {
      alert("Prompt Name/ID must be unique!");
      return;
    }

    // ✅ Validation for Role Selection
    if (!selectedRole) {
      alert("Please select a role before saving.");
      return;
    }
    
    const docRef = await addDoc(collection(db, "prompts"), {
      name: promptName,
      prompt: detailedPrompt,
      role: selectedRole  // ✅ Save selected role in database
    });

    setPrompts([...prompts, { id: docRef.id, name: promptName, prompt: detailedPrompt, role: selectedRole }]);
    
    // ✅ Clear fields after saving
    setPromptName("");
    setDetailedPrompt("");
    setSelectedRole("");
  };

  const handleDeletePrompt = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this prompt?");
  if (!confirmDelete) return;  // ✅ Cancel deletion if user selects "No"

  try {
    await deleteDoc(doc(db, "prompts", id));
    setPrompts(prompts.filter(p => p.id !== id));
    alert("Prompt deleted successfully!");  // ✅ Show success message
  } catch (error) {
    console.error("Error deleting prompt: ", error);
    alert("Failed to delete prompt. Please try again.");  // ✅ Error handling
  }
};


  const handleEditPrompt = (id) => {
    const prompt = prompts.find(p => p.id === id);
    setEditingId(id);
    setPromptName(prompt.name);
    setSelectedRole(prompt.selectedRole);
    setDetailedPrompt(prompt.prompt);
  };

  const handleUpdatePrompt = async () => {
    if (editingId) {
      await updateDoc(doc(db, "prompts", editingId), {
        prompt: detailedPrompt,
      });

      setPrompts(prompts.map(p => p.id === editingId ? { ...p, prompt: detailedPrompt, role: selectedRole } : p));
      setEditingId(null);
      setPromptName("");
      setSelectedRole("");
      setDetailedPrompt("");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-800 text-white">
      {/* ✅ Back to Dashboard Link */}
      <div className="flex justify-end mb-4">
        <Link to="/dashboard" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Back to Dashboard
        </Link>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Prompt List</h2>
      
      <div className="flex flex-col space-x-4 mb-4">
        <input
          type="text"
          placeholder="Enter Prompt Name/ID"
          value={promptName}
          onChange={(e) => setPromptName(e.target.value)}
          className="border p-2 resize 
          bg-gray-100 dark:bg-gray-800 
          text-black dark:text-white"
          disabled={editingId !== null}
        />

        {/* ✅ New Role Selection Dropdown */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border p-2 
          bg-gray-100 dark:bg-gray-800 
          text-black dark:text-white"
        >
          <option value="">Select the Job Role</option>  {/* ✅ Default placeholder */}
          <option value="Cross Platform Mobile App Internee (Android & iOS)">Cross Platform Mobile App Internee (Android & iOS)</option>
          <option value="Full Stack Developer Internee">Full Stack Developer Internee</option>
          <option value="QA Engineer Internee">QA Engineer Internee</option>
        </select>

        <textarea
          placeholder="Enter Detailed Prompt"
          maxLength="10240"
          value={detailedPrompt}
          onChange={(e) => setDetailedPrompt(e.target.value)}
          // ✅ Fixed contrast issue
          className="border p-2 min-h-[200px] resize 
          bg-gray-100 dark:bg-gray-800 
          text-black dark:text-white"
        />
        {/* Buttons shown when editing */}
        {editingId ? (
          <div className="flex space-x-2">
            <button onClick={handleUpdatePrompt} className="bg-yellow-500 text-white px-4 py-2">
              Update 
            </button>
            <button onClick={handleCancelEdit} className="bg-gray-600 text-white px-4 py-2">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleAddPrompt} className="bg-green-500 text-white px-4 py-2">
            Add Prompt
          </button>
        )}
      </div>


        {prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
            No prompts found. Start by adding a new prompt!
            </div>
        ) : (
        <table className="min-w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-700">
            <th className="border p-2">Prompt Name/ID</th>
            <th className="border p-2">Role</th>  {/* ✅ Add Role Column */}
            <th className="border p-2">Detailed Prompt</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((p) => (
            <tr key={p.id} className="border-t border-gray-700">
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.role}</td>  {/* ✅ Display Role */}
              <td className="border p-2">{p.prompt}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEditPrompt(p.id)} className="bg-blue-500 text-white px-2 py-1">
                  Edit
                </button>
                <button onClick={() => handleDeletePrompt(p.id)} className="bg-red-500 text-white px-2 py-1">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        )}
    </div>
  );
};

export default PromptsPage;
