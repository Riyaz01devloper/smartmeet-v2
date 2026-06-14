"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import { api } from "@/services/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("select a file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await api.post(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Backend Response");
      
       console.log( response.data);



      setResult(response.data);
      toast.success("Meeting uploaded successfully");
    } catch (error:any) {
       alert("ERROR");
       toast.error("Upload failed");

      console.log("Full Error",error);
      console.log("Response:",error.response);
      console.log("Request:",error.request);
      console.log("Message",error.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        Upload Meeting
      </h1>

      <input
        type="file"
        accept=".mp3,.wav"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        onClick={handleUpload}
        className="border px-4 py-2 rounded ml-4"
      >
        Upload
      </button>

      {loading && (
        <p className="mt-4">
          Processing Audio...
        </p>
      )}
    
      {result && (
        <div className="mt-8">
        

         

          <div className="border p-4 rounded mt-2">
            {result.transcript}
          </div>

          <h2 className="font-bold text-xl mt-8">
            Summary
          </h2>
        
          <div className="border p-4 rounded mt-2">
            {result.summary}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Action Items
          </h2>
          <div className="border rounded p-4 mb-6">
            {result.tasks?.map((task:string, index:number)=>(
              <li key={index}>{task}</li>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Decisions
          </h2>
           <div className="border rounded p-4 mb-6">
            {result.decisions?.map((decision:string, index:number)=>(
              <li key={index}>{decision}</li>
            ))}
          </div>
           <h2 className="font-bold text-xl">
            Transcript
          </h2>
            <div className="border rounded p-4 whitespace-pre-wrap">
      {result.transcript}
    </div>

        </div>
        
      )}
      
    </div>
  );
}
