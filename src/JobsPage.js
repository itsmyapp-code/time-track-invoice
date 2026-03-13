import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Webcam from "react-webcam";
import { FaPlay, FaStop, FaPlus, FaTrash, FaEdit, FaBriefcase, FaCamera, FaImage, FaFileAlt, FaBars, FaTimes, FaArchive, FaBoxOpen, FaMicrophone } from "react-icons/fa";
import VoiceInput from "./components/VoiceInput";
import { uploadJobPhoto, fetchJobPhotos, deleteJobPhoto } from "./jobPhotoService";
import { auth } from "./firebase";

// Removed fixed stages, allow free text
// const PHOTO_STAGES = ["Start", "In Progress", "Completion"];

function formatUKDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatTime(ms) {
  if (!ms) return "0h 0m";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function JobsPage({
  clients,
  jobs,
  startTimer,
  stopTimer,
  handleManualEntry,
  sessions,
  handleAddJob,
  deleteSession,
  deleteJob,
  archiveJob,
  dayItems = [],
  deleteDayItem,
  // Remove setActiveView, use navigate instead
}) {
  const navigate = useNavigate();
  // Photo state per job (from Firebase)
  const [jobPhotos, setJobPhotos] = useState({});
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoJobId, setPhotoJobId] = useState("");
  const [photoStage, setPhotoStage] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Report modal state
  // PDF Export for Job Photo Report
  function handlePhotoReportPDF(jobId) {
    const job = jobs.find(j => j.id === jobId);
    const client = job ? clients.find(c => c.id === job.clientId) : null;
    const photos = jobPhotos[jobId] || [];
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Job Photo Report", 40, 40);

    // Client & Job details
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text([`Client: ${client?.name || "-"}`, `Job: ${job?.name || "-"}`], 40, 65);

    // Table of photos (remove 'Photo' column)
    const tableRows = photos.map(photo => [
      photo.stage,
      photo.date ? new Date(photo.date).toLocaleDateString("en-GB") : "-"
    ]);
    autoTable(doc, {
      startY: 90,
      head: [["Stage", "Date"]],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 64, 154] },
      theme: "grid"
    });

    // Add images below the table, larger and keep aspect ratio
    let y = doc.lastAutoTable.finalY + 20;
    const loadImage = url => new Promise(resolve => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    const addImages = async () => {
      for (let idx = 0; idx < photos.length; idx++) {
        const photo = photos[idx];
        if (photo.imageUrl) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${photo.stage} (${photo.date ? new Date(photo.date).toLocaleDateString("en-GB") : "-"})`, 40, y);
          const img = await loadImage(photo.imageUrl);
          if (img) {
            // Calculate max width/height for A4, keep aspect ratio
            const maxWidth = 320, maxHeight = 220;
            let drawWidth = img.width, drawHeight = img.height;
            if (drawWidth > maxWidth) {
              drawHeight = drawHeight * (maxWidth / drawWidth);
              drawWidth = maxWidth;
            }
            if (drawHeight > maxHeight) {
              drawWidth = drawWidth * (maxHeight / drawHeight);
              drawHeight = maxHeight;
            }
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            doc.addImage(dataUrl, 'JPEG', 40, y + 10, drawWidth, drawHeight);
            y += drawHeight + 30;
          } else {
            doc.setFontSize(9);
            doc.text("Image could not be loaded", 40, y + 30);
            y += 40;
          }
        }
      }
      // Footer branding (logos with correct aspect ratio)
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 60;
      // Load logos and keep aspect ratio
      const logoImg1 = await loadImage(`/itsmyapp-logo.png?v=${new Date().getTime()}`);
      const logoImg2 = await loadImage(`/logo.png?v=${new Date().getTime()}`);
      let logoWidth, logoHeight = 30; // Set a fixed height
      if (logoImg1) {
        logoWidth = Math.round(logoHeight * (logoImg1.width / logoImg1.height));
        doc.addImage(logoImg1, 'PNG', 40, footerY - logoHeight, logoWidth, logoHeight);
      }
      if (logoImg2) {
        logoWidth = Math.round(logoHeight * (logoImg2.width / logoImg2.height));
        doc.addImage(logoImg2, 'PNG', 100, footerY - logoHeight, logoWidth, logoHeight);
      }
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Developed by itsmyapp.co.uk © 2025`, 40, footerY);
      doc.text(`This Report was created using Time Track Invoice part of the itsmyapp.co.uk development`, 40, footerY + 15);
      doc.save(`JobPhotoReport_${client?.name || "Client"}_${job?.name || "Job"}.pdf`);
    };
    addImages();
  }
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportJobId, setReportJobId] = useState("");

  // Manual Entry Modal
  const [showManual, setShowManual] = useState(false);
  const [manualJobId, setManualJobId] = useState("");
  const [manual, setManual] = useState({
    startTime: "",
    endTime: "",
    description: ""
  });

  // Show/hide sessions per job
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Show/hide jobs per client
  const [expandedClientId, setExpandedClientId] = useState(null);

  // Add Job Modal
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJob, setNewJob] = useState({ name: "", rate: "", clientId: "" });

  // Group jobs by client, only include clients with jobs
  const visibleJobs = jobs.filter(j => {
    const client = clients.find(c => c.id === j.clientId);
    const isClientArchived = client?.isArchived;
    if (showArchived) {
      return j.isArchived || isClientArchived;
    }
    return !j.isArchived && !isClientArchived;
  });
  const sortedJobs = [...visibleJobs].sort((a, b) => a.name.localeCompare(b.name));
  const jobsByClient = clients
    .map(client => ({
      ...client,
      jobs: sortedJobs.filter(job => job.clientId === client.id)
    }))
    .filter(client => client.jobs.length > 0);

  // Find running session for job
  const getRunningSession = jobId =>
    sessions.find(s => s.jobId === jobId && !s.endTime);

  // Add Job Handler
  const handleJobAdd = () => {
    if (!newJob.name || !newJob.rate || !newJob.clientId) return;
    handleAddJob({
      name: newJob.name,
      rate: parseFloat(newJob.rate),
      clientId: newJob.clientId
    });
    setNewJob({ name: "", rate: "", clientId: "" });
    setShowAddJob(false);
  };

  // Manual Entry handler
  const handleManualSave = () => {
    if (!manual.startTime || !manual.endTime || !manualJobId) return;
    const startTime = new Date(manual.startTime).getTime();
    const endTime = new Date(manual.endTime).getTime();
    const duration = Math.ceil((endTime - startTime) / 60000 / 15) * 15 * 60000;
    handleManualEntry(manualJobId, { startTime, endTime, duration, description: manual.description });
    setManual({ startTime: "", endTime: "", description: "" });
    setManualJobId("");
    setShowManual(false);
  };

  // --- PHOTO UPLOAD LOGIC (Firebase) ---
  // Make photo upload more robust
  async function handlePhotoAdd(e) {
    e.preventDefault();
    if (!photoFile || !photoStage || !photoDate || !photoJobId) {
      alert("Please fill in all fields and select a photo.");
      return;
    }
    let fileToUpload = photoFile;
    // If photoFile is a Blob (from webcam), convert to File
    if (photoFile instanceof Blob && !(photoFile instanceof File)) {
      fileToUpload = new File([photoFile], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    }
    try {
      await uploadJobPhoto({
        userId: auth.currentUser.uid,
        jobId: photoJobId,
        stage: photoStage,
        date: photoDate,
        file: fileToUpload,
      });
      if (photoJobId) {
        const photos = await fetchJobPhotos(photoJobId, auth.currentUser.uid);
        setJobPhotos(prev => ({ ...prev, [photoJobId]: photos }));
      }
      setPhotoFile(null);
      setPhotoDate("");
      setPhotoStage("");
      setPhotoJobId("");
      setShowPhotoModal(false);
    } catch (err) {
      alert("Photo upload failed. Please try again or check your connection.");
    }
  }

  useEffect(() => {
    async function loadPhotos() {
      // FIX: Only fetch photos if expandedJobId is a non-empty string
      if (
        typeof expandedJobId === "string" &&
        expandedJobId.trim() !== "" &&
        expandedJobId !== null
      ) {
        try {
          const photos = await fetchJobPhotos(expandedJobId, auth.currentUser ? auth.currentUser.uid : "");
          setJobPhotos(prev => ({ ...prev, [expandedJobId]: photos }));
        } catch (err) {
          console.error("Could not fetch job photos for expandedJobId:", expandedJobId, err);
        }
      }
    }
    loadPhotos();
  }, [expandedJobId]);

  useEffect(() => {
    async function loadPhotos() {
      if (
        showReportModal &&
        typeof reportJobId === "string" &&
        reportJobId.trim() !== "" &&
        reportJobId !== null
      ) {
        try {
          const photos = await fetchJobPhotos(reportJobId, auth.currentUser ? auth.currentUser.uid : "");
          setJobPhotos(prev => ({ ...prev, [reportJobId]: photos }));
        } catch (err) {
          console.error("Could not fetch job photos for reportJobId:", reportJobId, err);
        }
      }
    }
    loadPhotos();
  }, [showReportModal, reportJobId]);

  async function handleDeletePhoto(jobId, idx) {
    if (
      typeof jobId !== "string" ||
      jobId.trim() === "" ||
      jobId === null ||
      !jobPhotos[jobId]
    ) return;
    const photo = jobPhotos[jobId][idx];
    const userId = auth.currentUser ? auth.currentUser.uid : "";
    await deleteJobPhoto(userId, jobId, photo);
    try {
      const photos = await fetchJobPhotos(jobId, userId);
      setJobPhotos(prev => ({ ...prev, [jobId]: photos }));
    } catch (err) {
      console.error("Could not fetch job photos for jobId:", jobId, err);
    }
  }

  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);
  // Consistent button and card styles
  const cardClass = "app-card mb-4 rounded-lg shadow-sm bg-white p-2";
  const buttonClass = "app-add-btn flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition";

  const isModalOpen = showPhotoModal || showAddJob || showManual || showReportModal;

  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className="p-2 md:p-4" style={{ minHeight: "100vh" }}>
      {/* Mobile Dropdown Menu Button on the left */}
      {/* Mobile Menu Removed */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-800">
          <FaBriefcase className="text-indigo-600" /> Jobs
        </h2>
        <div className="flex gap-2">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition shadow-sm border ${showArchived ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <><FaBoxOpen /> Show Active Jobs</> : <><FaArchive /> Show Archived Jobs</>}
          </button>
          <button
            className={buttonClass}
            onClick={() => setShowAddJob(true)}
          >
            <FaPlus /> <span className="hidden sm:inline">Add Job</span>
          </button>
        </div>
      </div>
      {/* Grouped by Customer (Client) */}
      {jobsByClient.length === 0 ? (
        <div className="text-gray-500 mb-4">No jobs found.</div>
      ) : (
        <div className="mb-8">
          {jobsByClient.map(client => (
            <div key={client.id} className={cardClass}>
              <button
                className="w-full text-left px-4 py-3 bg-blue-100 hover:bg-blue-200 font-semibold text-blue-900 rounded-t"
                onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
              >
                {client.name}
              </button>
              {expandedClientId === client.id && (
                <div className="pl-2 pr-2 pb-3">
                  <div className="overflow-x-auto rounded-lg">
                    <div className="flex flex-col gap-4">
                      {client.jobs.map(job => (
                        <div key={job.id} className={cardClass}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="font-semibold text-base mb-2 sm:mb-0">{job.name}</div>
                            <div className="flex flex-wrap gap-2">
                              {/* Timer controls */}
                              {!getRunningSession(job.id) ? (
                                <button
                                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
                                  onClick={() => startTimer(job.id)}
                                  title="Start Timer"
                                >
                                  <FaPlay />
                                </button>
                              ) : (
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                                  onClick={() => stopTimer(job.id)}
                                  title="Stop Timer"
                                >
                                  <FaStop />
                                </button>
                              )}
                              <button
                                className="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded-full"
                                onClick={() => {
                                  setManualJobId(job.id);
                                  setShowManual(true);
                                }}
                                title="Manual Entry"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="bg-purple-300 hover:bg-purple-500 text-white p-2 rounded-full"
                                onClick={() => {
                                  setPhotoJobId(job.id);
                                  setShowPhotoModal(true);
                                }}
                                title="Add Job Photo"
                              >
                                <FaCamera />
                              </button>
                              <button
                                className="bg-orange-300 hover:bg-orange-500 text-white p-2 rounded-full"
                                onClick={async () => {
                                  setReportJobId(job.id);
                                  setShowReportModal(true);
                                  if (
                                    typeof job.id === "string" &&
                                    job.id.trim() !== "" &&
                                    job.id !== null
                                  ) {
                                    try {
                                      const photos = await fetchJobPhotos(job.id);
                                      setJobPhotos(prev => ({ ...prev, [job.id]: photos }));
                                    } catch (err) {
                                      console.error("Could not fetch job photos for job.id:", job.id, err);
                                    }
                                  }
                                }}
                                title="Job Photo Report"
                              >
                                <FaFileAlt />
                              </button>
                              <button
                                className={`${job.isArchived ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'} text-white p-2 rounded-full`}
                                onClick={() => archiveJob && archiveJob(job.id, !job.isArchived)}
                                title={job.isArchived ? "Unarchive Job" : "Archive Job"}
                              >
                                {job.isArchived ? <FaBoxOpen /> : <FaArchive />}
                              </button>

                              <button
                                className="bg-red-300 hover:bg-red-500 text-white p-2 rounded-full"
                                onClick={() => deleteJob(job.id)}
                                title="Delete Job"
                              >
                                <FaTrash />
                              </button>
                              <button
                                className="bg-blue-200 hover:bg-blue-400 text-blue-900 p-2 rounded-full text-xs"
                                onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                              >
                                {expandedJobId === job.id ? "Hide Sessions" : "Show Sessions"}
                              </button>
                            </div>
                          </div>
                          {/* Show job sessions if expanded */}
                          {expandedJobId === job.id && (
                            <div className="bg-blue-50 mt-2 rounded p-2 w-full overflow-x-auto">
                              <span className="font-medium">Sessions:</span>
                              {(() => {
                                // Sort sessions newest first
                                const jobSessions = (sessions || [])
                                  .filter(s => s.jobId === job.id)
                                  .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
                                if (jobSessions.length === 0)
                                  return <div className="text-gray-500 mt-1">No sessions for this job.</div>;
                                return (
                                  <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <table className="min-w-[340px] border text-xs mt-2 w-full">
                                      <thead>
                                        <tr className="bg-gray-100">
                                          <th className="py-1 px-1 border">Start</th>
                                          <th className="py-1 px-1 border">End</th>
                                          <th className="py-1 px-1 border">Duration</th>
                                          <th className="py-1 px-1 border">Notes</th>
                                          <th className="py-1 px-1 border">Delete</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {jobSessions.map(s => (
                                          <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="py-1 px-1 border">{formatUKDate(s.startTime)}</td>
                                            <td className="py-1 px-1 border">{formatUKDate(s.endTime)}</td>
                                            <td className="py-1 px-1 border">{formatTime(s.duration)}</td>
                                            <td className="py-1 px-1 border text-[10px] italic">{s.description || '-'}</td>
                                            <td className="py-1 px-1 border" style={{ textAlign: 'center' }}>
                                              <button
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full flex items-center justify-center"
                                                style={{ minWidth: 32, minHeight: 32 }}
                                                onClick={() => deleteSession(s.id)}
                                                title="Delete session"
                                                aria-label="Delete session"
                                              >
                                                <FaTrash size={16} />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                );
                              })()}

                              {/* --- DAY ITEMS (Log Day / 1/2 Day) --- */}
                              {(() => {
                                const jobDayItems = (dayItems || [])
                                  .filter(item => item.jobId === job.id)
                                  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                                if (jobDayItems.length > 0) {
                                  return (
                                    <div className="mt-4">
                                      <span className="font-medium">Day & Half-Day Logs:</span>
                                      <div style={{ overflowX: 'auto', width: '100%' }}>
                                        <table className="min-w-[340px] border text-xs mt-2 w-full">
                                          <thead>
                                            <tr className="bg-orange-50">
                                              <th className="py-1 px-1 border">Date</th>
                                              <th className="py-1 px-1 border">Type</th>
                                              <th className="py-1 px-1 border">Delete</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {jobDayItems.map(item => (
                                              <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="py-1 px-1 border">{formatUKDate(item.date)}</td>
                                                <td className="py-1 px-1 border">{item.type === 'day' ? 'Full Day' : 'Half Day'}</td>
                                                <td className="py-1 px-1 border" style={{ textAlign: 'center' }}>
                                                  <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full flex items-center justify-center mx-auto"
                                                    style={{ minWidth: 32, minHeight: 32 }}
                                                    onClick={() => deleteDayItem && deleteDayItem(item.id)}
                                                    title="Delete log"
                                                    aria-label="Delete log"
                                                  >
                                                    <FaTrash size={16} />
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {/* --- END DAY ITEMS --- */}
                              {/* --- PHOTO GALLERY --- */}
                              <div className="mt-4">
                                <div className="font-medium flex items-center gap-2">
                                  <FaImage /> Job Photos:
                                </div>
                                {(jobPhotos[job.id] && jobPhotos[job.id].length > 0) ? (
                                  <div className="flex flex-wrap gap-4 mt-2">
                                    {jobPhotos[job.id]
                                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                                      .map((photo, idx) => (
                                        <div key={photo.id || idx} style={{ textAlign: "center", maxWidth: 120, position: "relative" }}>
                                          <img
                                            src={photo.imageUrl}
                                            alt={`Job stage ${photo.stage}`}
                                            style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc" }}
                                          />
                                          <div className="text-xs mt-1">{photo.stage} <br /> {formatUKDate(photo.date)}</div>
                                          <button
                                            title="Delete photo"
                                            style={{
                                              position: "absolute",
                                              top: 4,
                                              right: 4,
                                              background: "#f44336",
                                              color: "#fff",
                                              border: "none",
                                              borderRadius: "50%",
                                              width: 24,
                                              height: 24,
                                              cursor: "pointer"
                                            }}
                                            onClick={() => handleDeletePhoto(job.id, idx)}
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 mt-1">No photos for this job.</div>
                                )}
                              </div>
                              {/* --- END PHOTO GALLERY --- */}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 2000, overscrollBehavior: 'contain' }}>
          <div className="bg-white rounded p-6 w-full max-w-md mx-4" style={{ position: 'relative', zIndex: 2001 }}>
            <h3 className="font-bold text-lg mb-2 text-indigo-600">Add Job (v2)</h3>
            <form onSubmit={e => { e.preventDefault(); handleJobAdd(); }}>
              <div className="mb-2">
                <label>Job Name:</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={newJob.name}
                  onChange={e => setNewJob(j => ({ ...j, name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Hourly Rate (£):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="border rounded px-2 py-1 w-full"
                  value={newJob.rate}
                  onChange={e => setNewJob(j => ({ ...j, rate: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Client:</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={newJob.clientId}
                  onChange={e => {
                    const clientId = e.target.value;
                    const client = clients.find(c => c.id === clientId);
                    setNewJob(j => ({
                      ...j,
                      clientId,
                      rate: client?.hourRate ? client.hourRate.toString() : j.rate
                    }));
                  }}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">
                  Save Job
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded"
                  onClick={() => setShowAddJob(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 2000, overscrollBehavior: 'contain' }}>
          <div className="bg-white rounded p-6 w-full max-w-md mx-4" style={{ position: 'relative', zIndex: 2001 }}>
            <h3 className="font-bold text-lg mb-2 text-indigo-600">Manual Session Entry (v2)</h3>
            <form onSubmit={e => { e.preventDefault(); handleManualSave(); }}>
              <div className="mb-2">
                <label>Start Date & Time:</label>
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1 w-full"
                  value={manual.startTime}
                  onChange={e => setManual(m => ({ ...m, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-2">
                <label>End Date & Time:</label>
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1 w-full"
                  value={manual.endTime}
                  onChange={e => setManual(m => ({ ...m, endTime: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Description / Notes:</label>
                <div className="relative">
                  <textarea
                    className="border rounded px-2 py-1 w-full pr-10"
                    rows={2}
                    value={manual.description}
                    onChange={e => setManual(m => ({ ...m, description: e.target.value }))}
                    placeholder="Describe the work..."
                  />
                  <div className="absolute right-1 bottom-1">
                    <VoiceInput 
                      onTranscription={(text) => setManual(m => ({ ...m, description: m.description ? `${m.description} ${text}` : text }))} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">
                  Save Session
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded"
                  onClick={() => setShowManual(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Photo Add Modal */}
      {showPhotoModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 2000, overscrollBehavior: 'contain' }}>
          <div className="bg-white rounded p-6 w-full max-w-md mx-4" style={{ position: 'relative', zIndex: 2001 }}>
            <h3 className="font-bold text-lg mb-2 text-indigo-600">Add Job Photo (v2)</h3>
            <form onSubmit={handlePhotoAdd}>
              <div className="mb-2">
                <label>Stage (free text):</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={photoStage}
                  onChange={e => setPhotoStage(e.target.value)}
                  placeholder="e.g. Start, In Progress, Completion, or any description"
                  required
                />
              </div>
              <div className="mb-2">
                <label>Date:</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1 w-full"
                  value={photoDate}
                  onChange={e => setPhotoDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Photo:</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() => setShowWebcam(true)}
                  >Take Photo</button>
                  <button
                    type="button"
                    className="bg-gray-600 text-white px-2 py-1 rounded"
                    onClick={() => document.getElementById('job-photo-upload-input').click()}
                  >Choose file from Device</button>
                </div>
                {/* Hidden file input for camera capture */}
                {/* Webcam modal for custom camera capture */}
                {showWebcam && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', position: 'relative', maxWidth: 340 }}>
                      <Webcam
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        style={{ width: 300, borderRadius: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          className="bg-green-600 text-white px-3 py-2 rounded"
                          onClick={() => {
                            const webcam = document.querySelector('video');
                            if (webcam) {
                              const canvas = document.createElement('canvas');
                              canvas.width = webcam.videoWidth;
                              canvas.height = webcam.videoHeight;
                              canvas.getContext('2d').drawImage(webcam, 0, 0);
                              canvas.toBlob(blob => {
                                setPhotoFile(blob);
                                setShowWebcam(false);
                              }, 'image/jpeg');
                            }
                          }}
                        >Capture</button>
                        <button
                          className="bg-gray-400 text-white px-3 py-2 rounded"
                          onClick={() => setShowWebcam(false)}
                        >Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Hidden file input for upload from device */}
                <input
                  id="job-photo-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoFile(e.target.files[0]);
                    } else {
                      setPhotoFile(null);
                    }
                  }}
                />
                <small style={{ color: '#666' }}>Choose 'Take Photo' for rear camera or 'Choose file from Device' for gallery.</small>
              </div>
              {photoFile && (
                <img src={URL.createObjectURL(photoFile)} alt="Preview" style={{ width: 120, margin: "8px auto", display: "block" }} />
              )}
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-purple-600 text-white px-3 py-2 rounded">
                  Upload
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded"
                  onClick={() => setShowPhotoModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Photo Report Modal */}
      {showReportModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 2000 }}>
          <div className="bg-white rounded p-6 w-full max-w-md mx-4" style={{ maxHeight: "90vh", overflowY: "auto", position: 'relative', zIndex: 2001 }}>
            <h3 className="font-bold text-lg mb-2">Job Photo Report</h3>
            <div>
              {(jobPhotos[reportJobId] && jobPhotos[reportJobId].length > 0) ? (
                jobPhotos[reportJobId]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((photo, idx) => (
                    <div key={photo.id || idx} style={{ marginBottom: 24 }}>
                      <strong>{photo.stage} ({formatUKDate(photo.date)})</strong>
                      <div>
                        <img src={photo.imageUrl} alt={`Stage ${photo.stage}`} style={{ width: 200, borderRadius: 8, border: "1px solid #ccc" }} />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-gray-500">No photos for this job.</div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded"
                onClick={() => setShowReportModal(false)}
              >
                Close
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded"
                onClick={() => handlePhotoReportPDF(reportJobId)}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="app-footer" style={{ textAlign: "center", marginTop: "32px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          borderBottom: "1px solid #ccc"
        }}>
          <img src={`/logo.png?v=${new Date().getTime()}`} alt="" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
          <img src={`/itsmyapp-logo.png?v=${new Date().getTime()}`} alt="" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
        </div>
      </footer>
    </div>
  );
}