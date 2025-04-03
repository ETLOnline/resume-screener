// src/components/Dashboard/CandidateDetailModal.js
import React from 'react';
import { FaLinkedin, FaEnvelope, FaWhatsapp, FaFileDownload } from 'react-icons/fa';

// Utility functions to find external links from candidate data
const getResumeUrl = (candidate) => {
  const possibleKeys = ["resume", "cv", "portfolio", "profile", "resumeurl"];
  for (const key in candidate) {
    if (possibleKeys.some(term => key.toLowerCase().includes(term))) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }
  return null;
};

const getLinkedInUrl = (candidate) => {
  for (const key in candidate) {
    if (key.toLowerCase().includes("linkedin")) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }
  return null;
};

const getWhatsAppLink = (candidate) => {
  const possibleKeys = ["phone", "number", "whatsapp", "contact"];
  for (const key in candidate) {
    if (possibleKeys.some(term => key.toLowerCase().includes(term))) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        const number = value.replace(/\D/g, "");
        if (number) {
          return `https://wa.me/${number}`;
        }
      }
    }
  }
  return null;
};

const getEmail = (candidate) => {
  for (const key in candidate) {
    if (key.toLowerCase().includes("email")) {
      const value = candidate[key];
      if (value && typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }
  return null;
};

// Format Firestore Timestamp or any object
const formatValue = (key, value) => {
  // Check for Firestore Timestamp
  if (
    value &&
    typeof value === "object" &&
    value.seconds !== undefined &&
    value.nanoseconds !== undefined
  ) {
    const date = new Date(value.seconds * 1000);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // If the key is "date" in name and value is a string, parse as date
  if (typeof value === "string" && key.toLowerCase().includes("date")) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // If it's some other object, JSON-stringify
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value || "N/A";
};

const CandidateDetailModal = ({ candidate, onClose }) => {
  const linkedInUrl = getLinkedInUrl(candidate);
  const resumeUrl = getResumeUrl(candidate);
  const whatsAppLink = getWhatsAppLink(candidate);
  const emailAddress = getEmail(candidate);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      <div className="bg-gray-800 rounded-lg shadow-lg z-10 w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-white font-bold"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-4 text-white">Candidate Details</h3>

        <div className="overflow-x-auto">
          <div className="mt-6 flex flex-wrap gap-2">
            {/* LinkedIn Button */}
            {linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#0077B5] text-white rounded hover:bg-[#005C82]"
              >
                <FaLinkedin />
                LinkedIn
              </a>
            )}

            {/* Email Button */}
            {emailAddress && (
              <a
                href={`mailto:${emailAddress}`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FaEnvelope />
                Email
              </a>
            )}

            {/* WhatsApp Button */}
            {whatsAppLink && (
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <FaWhatsapp />
                WhatsApp
              </a>
            )}

            {/* Resume Download Button */}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <FaFileDownload />
                Resume
              </a>
            )}
          </div>
          <table className="min-w-full mt-3 divide-y divide-gray-700">
            <tbody className="divide-y divide-gray-700">
              {Object.entries(candidate).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-4 py-2 font-semibold text-gray-300 capitalize border border-gray-700">
                    {key}
                  </td>
                  <td className="px-4 py-2 text-gray-100 border border-gray-700">
                    {formatValue(key, value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
